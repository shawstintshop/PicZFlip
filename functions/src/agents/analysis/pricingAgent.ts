// Pricing Agent - AI-powered market pricing analysis
import { getGeminiService } from '../../lib/gemini.js';
import { log } from '../../lib/logger.js';

export interface PricingAnalysis {
  averagePrice: number;
  medianPrice: number;
  priceRange: { min: number; max: number };
  sampleSize: number;
  marketTrend: 'rising' | 'falling' | 'stable' | 'volatile' | 'unknown';
  recommendation: string;
  suggestedPrice: { low: number; mid: number; high: number };
  confidence: number;
  priceDistribution: { bucket: string; count: number }[];
  outliers: { price: number; source: string; reason: string }[];
  platformPricing: Record<string, { suggested: number; range: { low: number; high: number } }>;
}

export const pricingAgent = {
  async analyzePricing(aggregatedData: any, item?: any): Promise<PricingAnalysis> {
    const startTime = Date.now();

    log('Pricing Agent: Starting analysis');

    const results = aggregatedData?.aggregatedResults || aggregatedData || [];
    const prices = extractPrices(results);
    const priceRange = aggregatedData?.priceRange || calcRange(prices);
    const avg = aggregatedData?.averagePrice || (prices.length > 0 ? prices.reduce((s: number, p: number) => s + p, 0) / prices.length : 0);
    const sampleSize = prices.length;

    // Statistical analysis
    const { outliers, cleanPrices } = removeOutliers(prices, results);
    const trend = detectTrend(cleanPrices);
    const distribution = buildDistribution(cleanPrices);

    // Calculate suggested prices
    const cleanAvg = cleanPrices.length > 0 ? cleanPrices.reduce((s, p) => s + p, 0) / cleanPrices.length : avg;
    const cleanMedian = calcMedian(cleanPrices);
    const suggestedPrice = {
      low: Math.round(cleanMedian * 0.85 * 100) / 100,
      mid: Math.round(cleanMedian * 100) / 100,
      high: Math.round(cleanMedian * 1.15 * 100) / 100,
    };

    // Platform-specific pricing
    const platformPricing = calculatePlatformPricing(cleanMedian, cleanAvg);

    // Confidence based on sample size and variance
    const confidence = calculateConfidence(cleanPrices, sampleSize);

    // Generate AI recommendation if Gemini is available
    let recommendation = generateBasicRecommendation(suggestedPrice, trend, sampleSize, confidence);
    try {
      const geminiRec = await generateAIRecommendation(item, suggestedPrice, trend, sampleSize, priceRange);
      if (geminiRec) recommendation = geminiRec;
    } catch (e: any) {
      // Gemini recommendation is optional
    }

    log('Pricing Agent: Complete', {
      sampleSize, median: cleanMedian, trend, confidence,
      duration: Date.now() - startTime,
    });

    return {
      averagePrice: Math.round(cleanAvg * 100) / 100,
      medianPrice: Math.round(cleanMedian * 100) / 100,
      priceRange: { min: priceRange.min, max: priceRange.max },
      sampleSize,
      marketTrend: trend,
      recommendation,
      suggestedPrice,
      confidence,
      priceDistribution: distribution,
      outliers,
      platformPricing,
    };
  },
};

function extractPrices(results: any[]): number[] {
  if (!Array.isArray(results)) return [];
  return results.map((r: any) => {
    if (typeof r.price === 'number') return r.price;
    if (typeof r.price === 'string') { const n = parseFloat(r.price.replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; }
    return 0;
  }).filter(p => p > 0);
}

function calcRange(prices: number[]) {
  if (prices.length === 0) return { min: 0, max: 0, median: 0 };
  const s = [...prices].sort((a, b) => a - b);
  return { min: s[0], max: s[s.length - 1], median: calcMedian(prices) };
}

function calcMedian(prices: number[]): number {
  if (prices.length === 0) return 0;
  const s = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function removeOutliers(prices: number[], results: any[]): { outliers: any[]; cleanPrices: number[] } {
  if (prices.length < 4) return { outliers: [], cleanPrices: prices };
  const sorted = [...prices].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const outliers: any[] = [];
  const cleanPrices: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < lower || prices[i] > upper) {
      outliers.push({ price: prices[i], source: results[i]?.source || 'unknown', reason: prices[i] < lower ? 'below range' : 'above range' });
    } else {
      cleanPrices.push(prices[i]);
    }
  }
  return { outliers, cleanPrices: cleanPrices.length > 0 ? cleanPrices : prices };
}

function detectTrend(prices: number[]): PricingAnalysis['marketTrend'] {
  if (prices.length < 3) return 'unknown';
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const variance = prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length;
  const cv = Math.sqrt(variance) / mean;
  if (cv > 0.5) return 'volatile';
  return 'stable';
}

function buildDistribution(prices: number[]): { bucket: string; count: number }[] {
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  if (range === 0) return [{ bucket: `$${min.toFixed(0)}`, count: prices.length }];

  const bucketCount = Math.min(5, prices.length);
  const bucketSize = range / bucketCount;
  const buckets: { bucket: string; count: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * bucketSize;
    const hi = lo + bucketSize;
    const count = prices.filter(p => p >= lo && (i === bucketCount - 1 ? p <= hi : p < hi)).length;
    buckets.push({ bucket: `$${lo.toFixed(0)}-$${hi.toFixed(0)}`, count });
  }
  return buckets;
}

function calculateConfidence(prices: number[], sampleSize: number): number {
  if (sampleSize === 0) return 0;
  let confidence = Math.min(40, sampleSize * 4); // up to 40 from sample size
  if (prices.length > 0) {
    const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
    const cv = Math.sqrt(prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length) / mean;
    confidence += Math.max(0, 40 - cv * 80); // up to 40 from low variance
  }
  confidence += Math.min(20, sampleSize * 2); // up to 20 more
  return Math.min(100, Math.round(confidence));
}

function calculatePlatformPricing(median: number, avg: number): Record<string, { suggested: number; range: { low: number; high: number } }> {
  const base = median || avg;
  if (base === 0) return {};
  return {
    ebay: { suggested: Math.round(base * 1.1 * 100) / 100, range: { low: Math.round(base * 0.9 * 100) / 100, high: Math.round(base * 1.3 * 100) / 100 } },
    amazon: { suggested: Math.round(base * 1.15 * 100) / 100, range: { low: Math.round(base * 0.95 * 100) / 100, high: Math.round(base * 1.35 * 100) / 100 } },
    facebook: { suggested: Math.round(base * 0.9 * 100) / 100, range: { low: Math.round(base * 0.75 * 100) / 100, high: Math.round(base * 1.1 * 100) / 100 } },
    mercari: { suggested: Math.round(base * 0.95 * 100) / 100, range: { low: Math.round(base * 0.8 * 100) / 100, high: Math.round(base * 1.15 * 100) / 100 } },
  };
}

function generateBasicRecommendation(suggested: any, trend: string, sampleSize: number, confidence: number): string {
  const parts: string[] = [];
  parts.push(`Based on ${sampleSize} comparable listings, we recommend pricing at $${suggested.mid.toFixed(2)}.`);
  if (confidence < 50) parts.push('Low sample size - consider researching further before listing.');
  else if (confidence > 80) parts.push('High confidence in this price recommendation.');
  if (trend === 'volatile') parts.push('Prices vary widely - consider starting higher and adjusting.');
  else if (trend === 'stable') parts.push('Market pricing is consistent - competitive pricing recommended.');
  parts.push(`Quick sale: $${suggested.low.toFixed(2)} | Fair market: $${suggested.mid.toFixed(2)} | Premium: $${suggested.high.toFixed(2)}`);
  return parts.join(' ');
}

async function generateAIRecommendation(item: any, suggested: any, trend: string, sampleSize: number, priceRange: any): Promise<string | null> {
  try {
    const geminiService = getGeminiService();
    const model = (geminiService as any).model;
    if (!model) return null;

    const prompt = `You are a marketplace pricing expert. Given this product data, provide a 2-3 sentence pricing recommendation.

Product: ${item?.details?.productName || 'Unknown'}
Brand: ${item?.details?.brand || 'Unknown'}
Condition: ${item?.details?.condition || 'used'}
Sample size: ${sampleSize} listings
Price range: $${priceRange?.min || 0} - $${priceRange?.max || 0}
Market trend: ${trend}
Suggested price: $${suggested.mid}

Be concise, actionable, and specific about pricing strategy.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return text?.trim() || null;
  } catch {
    return null;
  }
}

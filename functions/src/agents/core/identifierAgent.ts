// Identifier Agent - AI-powered product identification using Vision + Gemini
import { getVisionService, VisionAnalysisResult } from '../../lib/vision.js';
import { getGeminiService, GeminiAnalysisResult } from '../../lib/gemini.js';
import { log, err } from '../../lib/logger.js';

export interface IdentificationResult {
  category: string;
  subcategory: string;
  confidence: number;
  details: {
    productName: string;
    brand: string;
    model: string;
    condition: string;
    description: string;
    keyFeatures: string[];
    estimatedAge: string;
    reasoning: string;
  };
  visionData: VisionAnalysisResult;
  geminiData: GeminiAnalysisResult | null;
  searchQueries: string[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electronics: ['electronics', 'phone', 'laptop', 'computer', 'tablet', 'camera', 'headphone', 'speaker', 'monitor', 'keyboard', 'gaming', 'console'],
  clothing: ['clothing', 'shirt', 'dress', 'pants', 'jacket', 'shoe', 'sneaker', 'fashion', 'jeans', 'coat', 'hat', 'bag', 'handbag'],
  collectibles: ['collectible', 'vintage', 'antique', 'coin', 'stamp', 'card', 'figurine', 'comic', 'toy', 'memorabilia'],
  books: ['book', 'textbook', 'novel', 'magazine', 'publication'],
  automotive: ['car', 'vehicle', 'automotive', 'motorcycle', 'truck', 'wheel', 'tire', 'engine'],
  music: ['vinyl', 'record', 'instrument', 'guitar', 'piano', 'drum', 'musical', 'audio', 'turntable'],
  furniture: ['furniture', 'chair', 'table', 'desk', 'sofa', 'couch', 'shelf', 'cabinet', 'bed'],
  art: ['art', 'painting', 'sculpture', 'print', 'canvas', 'frame', 'artwork'],
  sports: ['sports', 'athletic', 'ball', 'racket', 'golf', 'bicycle', 'fitness'],
  tools: ['tool', 'power tool', 'drill', 'saw', 'wrench', 'hardware'],
  jewelry: ['jewelry', 'ring', 'necklace', 'bracelet', 'watch', 'earring', 'diamond', 'gold', 'silver'],
};

export const identifierAgent = {
  async identifyFromPhoto(imageBuffer: Buffer, userContext?: any): Promise<IdentificationResult> {
    const startTime = Date.now();
    try {
      log('Identifier Agent: Starting product identification', {
        imageSize: imageBuffer.length,
        hasUserContext: !!userContext,
      });

      // Stage 1: Google Cloud Vision analysis
      const visionService = getVisionService();
      const visionResult = await visionService.analyzeImage(imageBuffer);
      log('Identifier Agent: Vision analysis complete', {
        labels: visionResult.labels.length,
        objects: visionResult.objects.length,
        brands: visionResult.brands.length,
        hasText: visionResult.text.fullText.length > 0,
        duration: Date.now() - startTime,
      });

      // Stage 2: Gemini AI deep analysis
      let geminiResult: GeminiAnalysisResult | null = null;
      try {
        const geminiService = getGeminiService();
        geminiResult = await geminiService.analyzeProduct(imageBuffer, visionResult, userContext);
        log('Identifier Agent: Gemini analysis complete', {
          product: geminiResult.productIdentification.productName,
          confidence: geminiResult.productIdentification.confidence,
          duration: Date.now() - startTime,
        });
      } catch (geminiErr: any) {
        err('Identifier Agent: Gemini failed, using Vision-only', { error: geminiErr.message });
      }

      const result = buildIdentificationResult(visionResult, geminiResult);
      log('Identifier Agent: Identification complete', {
        category: result.category,
        product: result.details.productName,
        confidence: result.confidence,
        totalDuration: Date.now() - startTime,
      });
      return result;
    } catch (error: any) {
      err('Identifier Agent: Failed', { error: error.message, duration: Date.now() - startTime });
      throw error;
    }
  },

  async identifyItem(imageBuffer: Buffer): Promise<{ category: string; confidence: number; details: any }> {
    const result = await this.identifyFromPhoto(imageBuffer);
    return { category: result.category, confidence: result.confidence, details: result.details };
  },
};

function buildIdentificationResult(
  visionResult: VisionAnalysisResult,
  geminiResult: GeminiAnalysisResult | null
): IdentificationResult {
  if (geminiResult && geminiResult.metadata.confidenceScore > 20) {
    const pi = geminiResult.productIdentification;
    const mi = geminiResult.marketingInfo;
    return {
      category: pi.category.toLowerCase(),
      subcategory: pi.subcategory.toLowerCase(),
      confidence: pi.confidence / 100,
      details: {
        productName: pi.productName,
        brand: pi.brand,
        model: pi.model,
        condition: mi.condition,
        description: mi.description,
        keyFeatures: mi.keyFeatures,
        estimatedAge: mi.estimatedAge,
        reasoning: pi.reasoning,
      },
      visionData: visionResult,
      geminiData: geminiResult,
      searchQueries: buildGeminiSearchQueries(pi, mi, visionResult),
    };
  }

  const topLabel = visionResult.labels[0];
  const topObject = visionResult.objects[0];
  const detectedBrand = visionResult.brands[0];
  const category = inferCategory(visionResult);

  return {
    category,
    subcategory: 'general',
    confidence: Math.max(topLabel?.score || 0, topObject?.score || 0),
    details: {
      productName: topObject?.name || topLabel?.description || 'Unknown Item',
      brand: detectedBrand?.description || 'Unknown',
      model: '',
      condition: 'used',
      description: `${detectedBrand?.description || ''} ${topObject?.name || topLabel?.description || 'item'}`.trim(),
      keyFeatures: visionResult.labels.slice(0, 5).map(l => l.description),
      estimatedAge: 'Unknown',
      reasoning: 'Identified using Google Cloud Vision label and object detection',
    },
    visionData: visionResult,
    geminiData: null,
    searchQueries: buildVisionSearchQueries(visionResult),
  };
}

function inferCategory(visionResult: VisionAnalysisResult): string {
  const labels = visionResult.labels.map(l => l.description.toLowerCase());
  const allText = labels.join(' ');
  let bestCategory = 'general';
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (allText.includes(keyword)) score++;
    }
    if (score > bestScore) { bestScore = score; bestCategory = category; }
  }
  return bestCategory;
}

function buildGeminiSearchQueries(
  pi: GeminiAnalysisResult['productIdentification'],
  mi: GeminiAnalysisResult['marketingInfo'],
  visionResult: VisionAnalysisResult
): string[] {
  const queries: string[] = [];
  if (pi.brand && pi.brand !== 'Unknown' && pi.model) queries.push(`${pi.brand} ${pi.model}`);
  if (pi.productName && pi.productName !== 'Unknown Product') queries.push(pi.productName);
  if (pi.brand && pi.brand !== 'Unknown' && pi.productName) {
    const q = `${pi.brand} ${pi.productName}`;
    if (!queries.includes(q)) queries.push(q);
  }
  if (mi.suggestedTitle) queries.push(mi.suggestedTitle);
  if (visionResult.text.fullText) {
    const text = visionResult.text.fullText.trim();
    if (text.length > 2 && text.length < 100) queries.push(text);
  }
  return [...new Set(queries)].slice(0, 5);
}

function buildVisionSearchQueries(visionResult: VisionAnalysisResult): string[] {
  const queries: string[] = [];
  const brand = visionResult.brands[0]?.description;
  const object = visionResult.objects[0]?.name;
  const topLabels = visionResult.labels.slice(0, 3).map(l => l.description);
  if (brand && object) queries.push(`${brand} ${object}`);
  if (object) queries.push(object);
  if (topLabels.length > 0) queries.push(topLabels.join(' '));
  if (visionResult.text.fullText) {
    const text = visionResult.text.fullText.trim();
    if (text.length > 2 && text.length < 100) queries.push(text);
  }
  return [...new Set(queries)].slice(0, 5);
}

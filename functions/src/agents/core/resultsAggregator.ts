// Results Aggregator Agent - Deduplication, ranking, and price aggregation
import { log } from '../../lib/logger.js';

export interface AggregatedItem {
  title: string;
  normalizedTitle: string;
  price: number;
  currency: string;
  url: string;
  image?: string;
  source: string;
  sourceId: string;
  condition?: string;
  seller?: string;
  shipping?: string;
  relevanceScore: number;
  duplicateGroup?: string;
}

export interface SourceSummary {
  sourceId: string;
  sourceName: string;
  itemCount: number;
  avgPrice: number;
  success: boolean;
  searchTime: number;
}

export interface AggregatedResults {
  totalResults: number;
  uniqueItems: number;
  aggregatedResults: AggregatedItem[];
  priceRange: { min: number; max: number; median: number; currency: string };
  averagePrice: number;
  sourceBreakdown: SourceSummary[];
  conditionBreakdown: Record<string, number>;
}

export const resultsAggregator = {
  async processSearchResults(searchResults: any, item?: any): Promise<AggregatedResults> {
    const startTime = Date.now();
    const results = searchResults?.results || searchResults || [];

    log('Results Aggregator: Processing', { sourceCount: Array.isArray(results) ? results.length : 0 });

    const allItems: AggregatedItem[] = [];
    const sourceBreakdown: SourceSummary[] = [];

    for (const sr of (Array.isArray(results) ? results : [])) {
      const items = sr.items || [];
      sourceBreakdown.push({
        sourceId: sr.sourceId || 'unknown', sourceName: sr.sourceName || 'Unknown',
        itemCount: items.length, avgPrice: avgPrice(items),
        success: sr.success !== false, searchTime: sr.searchTime || 0,
      });
      for (const raw of items) {
        allItems.push({
          title: raw.title || 'Untitled', normalizedTitle: normalize(raw.title || ''),
          price: toNum(raw.price), currency: raw.currency || 'USD',
          url: raw.url || '#', image: raw.image,
          source: sr.sourceName || sr.sourceId || 'Unknown', sourceId: sr.sourceId || 'unknown',
          condition: raw.condition, seller: raw.seller, shipping: raw.shipping,
          relevanceScore: 0,
        });
      }
    }

    // Score relevance
    const query = item?.details?.productName || '';
    for (const e of allItems) e.relevanceScore = relevance(e, query);

    // Deduplicate
    const deduped = deduplicate(allItems);
    deduped.sort((a, b) => b.relevanceScore - a.relevanceScore || a.price - b.price);

    const prices = deduped.filter(i => i.price > 0).map(i => i.price);
    const priceRange = calcPriceRange(prices);
    const avg = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length * 100) / 100 : 0;

    const conditionBreakdown: Record<string, number> = {};
    for (const e of deduped) { const c = e.condition || 'unknown'; conditionBreakdown[c] = (conditionBreakdown[c] || 0) + 1; }

    log('Results Aggregator: Complete', { total: allItems.length, unique: deduped.length, priceRange, duration: Date.now() - startTime });

    return { totalResults: allItems.length, uniqueItems: deduped.length, aggregatedResults: deduped.slice(0, 100), priceRange, averagePrice: avg, sourceBreakdown, conditionBreakdown };
  },

  async aggregateResults(results: any[]): Promise<any> {
    return this.processSearchResults(results);
  },
};

function normalize(t: string): string { return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }

function toNum(p: any): number {
  if (typeof p === 'number') return p;
  if (typeof p === 'string') { const n = parseFloat(p.replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; }
  return 0;
}

function avgPrice(items: any[]): number {
  const ps = items.map((i: any) => toNum(i.price)).filter(p => p > 0);
  return ps.length === 0 ? 0 : Math.round(ps.reduce((s, p) => s + p, 0) / ps.length * 100) / 100;
}

function relevance(entry: AggregatedItem, query: string): number {
  if (!query) return 50;
  const t = entry.normalizedTitle;
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let score = 0;
  if (t.includes(q)) score += 50;
  for (const w of words) { if (t.includes(w)) score += 15; }
  if (entry.price > 0) score += 10;
  if (entry.image) score += 5;
  if (entry.condition) score += 5;
  return Math.min(100, score);
}

function deduplicate(items: AggregatedItem[]): AggregatedItem[] {
  const groups = new Map<string, AggregatedItem[]>();
  for (const item of items) {
    const key = item.normalizedTitle.substring(0, 60);
    let found = false;
    for (const [gk, g] of groups) {
      if (jaccard(key, gk) > 0.7) { g.push(item); found = true; break; }
    }
    if (!found) groups.set(key, [item]);
  }
  const out: AggregatedItem[] = [];
  for (const g of groups.values()) {
    g.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const best = g[0];
    if (g.length > 1) best.duplicateGroup = `${g.length} similar`;
    out.push(best);
  }
  return out;
}

function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(/\s+/));
  const sb = new Set(b.split(/\s+/));
  const inter = [...sa].filter(w => sb.has(w)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

function calcPriceRange(prices: number[]) {
  if (prices.length === 0) return { min: 0, max: 0, median: 0, currency: 'USD' as const };
  const s = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const median = s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
  return { min: Math.round(s[0] * 100) / 100, max: Math.round(s[s.length - 1] * 100) / 100, median: Math.round(median * 100) / 100, currency: 'USD' as const };
}

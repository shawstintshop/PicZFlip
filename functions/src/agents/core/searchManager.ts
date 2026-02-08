// Search Manager Agent - Orchestrates parallel marketplace searches
import { SearchItem } from '../../adapters/base/baseAdapter.js';
import { AdapterManager } from '../../lib/adapterManager.js';
import { getSourceById } from '../../lib/sourceRegistry.js';
import { log, err } from '../../lib/logger.js';
import { ENV } from '../../env.js';

export interface SearchResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  items: SearchItem[];
  searchTime: number;
  query: string;
  error?: string;
}

export interface SearchManagerResult {
  results: SearchResult[];
  totalItems: number;
  successCount: number;
  failureCount: number;
  searchDuration: number;
}

export const searchManager = {
  async executeSearchPlan(searchPlan: any, item?: any): Promise<SearchManagerResult> {
    const startTime = Date.now();
    const results: SearchResult[] = [];
    const primaryEntries = searchPlan?.primary || [];
    const secondaryEntries = searchPlan?.secondary || [];

    log('Search Manager: Executing plan', { primary: primaryEntries.length, secondary: secondaryEntries.length });

    // Phase 1: Primary sources in parallel
    if (primaryEntries.length > 0) {
      const primary = await searchBatch(primaryEntries, item, ENV.MAX_CONCURRENT_SEARCHES);
      results.push(...primary);
    }

    // Phase 2: Secondary if time remains
    const elapsed = Date.now() - startTime;
    if (secondaryEntries.length > 0 && (ENV.SEARCH_TIMEOUT_MS - elapsed) > 5000) {
      const secondary = await searchBatch(secondaryEntries, item, Math.min(3, ENV.MAX_CONCURRENT_SEARCHES));
      results.push(...secondary);
    }

    const searchDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const totalItems = results.reduce((s, r) => s + r.items.length, 0);

    log('Search Manager: Complete', { sources: results.length, successCount, totalItems, searchDuration });
    return { results, totalItems, successCount, failureCount: results.length - successCount, searchDuration };
  },

  async performSearch(query: string, sources: string[]): Promise<any[]> {
    const entries = sources.map(id => ({ sourceId: id, sourceName: id, queries: [query], priority: 5, timeout: ENV.SEARCH_TIMEOUT_MS }));
    const result = await this.executeSearchPlan({ primary: entries, secondary: [], query, sources });
    return result.results.flatMap(r => r.items);
  },
};

async function searchBatch(entries: any[], item: any, maxConcurrent: number): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  for (let i = 0; i < entries.length; i += maxConcurrent) {
    const batch = entries.slice(i, i + maxConcurrent);
    const settled = await Promise.allSettled(batch.map((e: any) => searchSingle(e, item)));
    for (const r of settled) { if (r.status === 'fulfilled') results.push(r.value); }
    if (i + maxConcurrent < entries.length) await new Promise(res => setTimeout(res, 200));
  }
  return results;
}

async function searchSingle(entry: any, item: any): Promise<SearchResult> {
  const startTime = Date.now();
  const queries = entry.queries || [entry.query || 'item'];
  const timeout = entry.timeout || ENV.SEARCH_TIMEOUT_MS;

  try {
    const source = getSourceById(entry.sourceId);
    if (!source) return { sourceId: entry.sourceId, sourceName: entry.sourceName, success: false, items: [], searchTime: Date.now() - startTime, query: queries[0], error: 'Source not found' };

    const adapter = await AdapterManager.getAdapter(source.adapter);
    let allItems: SearchItem[] = [];
    let usedQuery = queries[0];

    for (const query of queries) {
      try {
        const items = await Promise.race<SearchItem[]>([
          adapter.search(query, item || {}, source),
          new Promise<SearchItem[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
        ]);
        if (items && items.length > 0) { allItems = items; usedQuery = query; break; }
      } catch { continue; }
    }

    return { sourceId: entry.sourceId, sourceName: source.name, success: true, items: allItems, searchTime: Date.now() - startTime, query: usedQuery };
  } catch (error: any) {
    err('Search Manager: Source failed', { sourceId: entry.sourceId, error: error.message });
    return { sourceId: entry.sourceId, sourceName: entry.sourceName, success: false, items: [], searchTime: Date.now() - startTime, query: queries[0], error: error.message };
  }
}

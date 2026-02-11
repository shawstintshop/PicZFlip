// Category Router Agent - AI-driven marketplace routing based on product identification
import { getSourcesByCategory, getSourcesByPriority, MarketplaceSource } from '../../lib/sourceRegistry.js';
import { log } from '../../lib/logger.js';

export interface SearchPlanEntry {
  sourceId: string;
  sourceName: string;
  queries: string[];
  priority: number;
  timeout: number;
}

export interface SearchPlan {
  primary: SearchPlanEntry[];
  secondary: SearchPlanEntry[];
  query: string;
  sources: string[];
}

export interface SearchStrategy {
  category: string;
  subcategory: string;
  sources: MarketplaceSource[];
  searchQueries: string[];
  strategy: 'comprehensive' | 'targeted' | 'specialty' | 'broad';
  maxConcurrent: number;
  searchPlan: SearchPlan;
}

const CATEGORY_ROUTING: Record<string, { categories: string[]; specialSources: string[]; strategy: SearchStrategy['strategy'] }> = {
  electronics: { categories: ['electronics', 'general'], specialSources: ['swappa', 'gazelle'], strategy: 'targeted' },
  clothing: { categories: ['clothing', 'fashion', 'accessories'], specialSources: ['poshmark', 'depop', 'grailed', 'therealreal', 'vinted'], strategy: 'comprehensive' },
  collectibles: { categories: ['collectibles', 'antiques', 'vintage'], specialSources: ['liveauctioneers', 'invaluable', 'worthpoint', 'rubylane'], strategy: 'specialty' },
  books: { categories: ['books', 'textbooks'], specialSources: ['abebooks', 'alibris'], strategy: 'targeted' },
  automotive: { categories: ['automotive', 'classic_cars'], specialSources: ['bringatrailer', 'carsandbids'], strategy: 'specialty' },
  music: { categories: ['music', 'instruments', 'vinyl'], specialSources: ['discogs', 'reverb'], strategy: 'specialty' },
  furniture: { categories: ['furniture', 'general', 'local'], specialSources: ['craigslist'], strategy: 'broad' },
  jewelry: { categories: ['jewelry', 'luxury', 'accessories'], specialSources: ['therealreal'], strategy: 'targeted' },
  art: { categories: ['art', 'antiques'], specialSources: ['liveauctioneers', 'invaluable'], strategy: 'specialty' },
  sports: { categories: ['general'], specialSources: [], strategy: 'broad' },
  tools: { categories: ['general'], specialSources: [], strategy: 'broad' },
  general: { categories: ['general'], specialSources: [], strategy: 'broad' },
};

export const categoryRouter = {
  async determineSearchStrategy(item: any): Promise<SearchStrategy> {
    const startTime = Date.now();
    const category = (item.category || 'general').toLowerCase();
    const subcategory = (item.subcategory || '').toLowerCase();

    log('Category Router: Determining search strategy', { category, subcategory });

    const routing = CATEGORY_ROUTING[category] || CATEGORY_ROUTING['general'];
    const categorySources = getSourcesByCategory(routing.categories);
    const generalSources = getSourcesByPriority(8);

    // Merge and deduplicate
    const seen = new Set<string>();
    const allSources: MarketplaceSource[] = [];
    for (const source of [...categorySources, ...generalSources]) {
      if (!seen.has(source.id)) { seen.add(source.id); allSources.push(source); }
    }

    // Prioritize specialty sources
    allSources.sort((a, b) => {
      const aBoost = routing.specialSources.includes(a.id) ? 10 : 0;
      const bBoost = routing.specialSources.includes(b.id) ? 10 : 0;
      return (b.priority + bBoost) - (a.priority + aBoost);
    });

    const searchQueries = item.searchQueries || buildSearchQueries(item);
    const maxConcurrent = getMaxConcurrent(routing.strategy, allSources.length);
    const searchPlan = buildSearchPlan(allSources, searchQueries, routing.strategy);

    log('Category Router: Strategy determined', {
      category, strategy: routing.strategy, sourceCount: allSources.length,
      queryCount: searchQueries.length, duration: Date.now() - startTime,
    });

    return { category, subcategory, sources: allSources, searchQueries, strategy: routing.strategy, maxConcurrent, searchPlan };
  },

  async routeToCategory(category: string): Promise<string[]> {
    const routing = CATEGORY_ROUTING[category] || CATEGORY_ROUTING['general'];
    return getSourcesByCategory(routing.categories).map(s => s.id);
  },
};

function buildSearchQueries(item: any): string[] {
  const queries: string[] = [];
  const d = item.details || {};
  if (d.brand && d.brand !== 'Unknown' && d.model) queries.push(`${d.brand} ${d.model}`);
  if (d.productName && d.productName !== 'Unknown Product') queries.push(d.productName);
  if (d.brand && d.brand !== 'Unknown' && d.productName) queries.push(`${d.brand} ${d.productName}`);
  if (queries.length === 0) queries.push(item.category || 'item');
  return [...new Set(queries)].slice(0, 5);
}

function getMaxConcurrent(strategy: string, count: number): number {
  const limits: Record<string, number> = { comprehensive: 10, targeted: 6, specialty: 5, broad: 8 };
  return Math.min(limits[strategy] || 5, count);
}

function buildSearchPlan(sources: MarketplaceSource[], queries: string[], strategy: string): SearchPlan {
  const pc = strategy === 'comprehensive' ? 8 : strategy === 'specialty' ? 4 : 6;
  const toEntry = (s: MarketplaceSource, maxQ: number): SearchPlanEntry => ({
    sourceId: s.id, sourceName: s.name, queries: queries.slice(0, maxQ),
    priority: s.priority, timeout: s.hasApi ? 15000 : 30000,
  });
  return {
    primary: sources.slice(0, pc).map(s => toEntry(s, 3)),
    secondary: sources.slice(pc).map(s => toEntry(s, 2)),
    query: queries[0] || 'item',
    sources: sources.map(s => s.id),
  };
}

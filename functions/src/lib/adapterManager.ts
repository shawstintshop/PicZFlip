// Adapter Manager - Manages marketplace search adapters with web scraping support
import { SearchItem, BaseAdapter } from '../adapters/base/baseAdapter.js';
import { MarketplaceSource, getSourceById } from './sourceRegistry.js';
import { log, err } from './logger.js';
import { ENV } from '../env.js';

/**
 * Generic web adapter that constructs search URLs and returns structured results.
 * Uses the marketplace's search URL pattern to build queries.
 */
class GenericWebAdapter extends BaseAdapter {
  readonly adapterId: string;
  readonly supportedCategories: string[];

  constructor(adapterId: string, categories: string[] = ['general']) {
    super();
    this.adapterId = adapterId;
    this.supportedCategories = categories;
  }

  async search(query: string, _itemData: any, source: MarketplaceSource): Promise<SearchItem[]> {
    this.validateSearchParams(query);
    await this.respectRateLimit(source);

    const startTime = Date.now();
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = source.baseUrl + source.searchPattern.replace('{query}', encodedQuery);

    try {
      // Use node-fetch to get the search page
      const fetchModule = await import('node-fetch');
      const fetch = fetchModule.default;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PicZFlip/1.0; marketplace-research)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(Math.min(timeout(), 25000)),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${source.name}`);
      }

      const html = await response.text();

      // Use cheerio to parse results
      const cheerioModule = await import('cheerio');
      const $ = cheerioModule.load(html);
      const items = this.extractItems($, source, query);

      this.logSearch(source.id, query, items.length);
      log('Adapter: Search complete', {
        source: source.id, query, items: items.length,
        duration: Date.now() - startTime,
      });

      return items;
    } catch (error: any) {
      err('Adapter: Search failed', { source: source.id, query, error: error.message });
      // Return empty results instead of throwing - search failure is not fatal
      return [];
    }
  }

  /**
   * Extract items from HTML using common marketplace patterns
   */
  private extractItems($: any, source: MarketplaceSource, query: string): SearchItem[] {
    const items: SearchItem[] = [];

    // Common CSS selectors for product listings across marketplaces
    const selectors = [
      '.s-result-item', '.srp-results .s-item', '.search-result',
      '[data-component-type="s-search-result"]', '.product-card',
      '.listing-card', '.item-card', '.search-item', '.result-item',
      '[data-testid="listing-card"]', '.product-tile', '.product-listing',
    ];

    let container: any = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) { container = found; break; }
    }

    if (!container || container.length === 0) {
      // Fallback: try generic product-like elements
      container = $('article, [itemtype*="Product"], .item, .card').filter((_: number, el: any) => {
        const text = $(el).text().toLowerCase();
        return text.includes('$') || text.includes('price');
      });
    }

    container.each((_index: number, el: any): undefined | false => {
      if (items.length >= 20) return false; // Max 20 items per source

      try {
        const $el = $(el);
        const title = this.cleanText(
          $el.find('h2, h3, .title, .item-title, .product-title, [data-testid="title"]').first().text() ||
          $el.find('a').first().attr('title') || ''
        );

        if (!title || title.length < 3) return;

        const priceText =
          $el.find('.price, .s-price, .item-price, .product-price, [data-testid="price"]').first().text() ||
          $el.find('[class*="price"]').first().text() || '';

        const price = this.parsePrice(priceText);

        const linkEl = $el.find('a[href]').first();
        const href = linkEl.attr('href') || '';
        const url = this.makeAbsoluteUrl(href, source.baseUrl);

        const imageEl = $el.find('img').first();
        const image = imageEl.attr('src') || imageEl.attr('data-src') || '';

        const conditionText = $el.find('.condition, [data-testid="condition"]').first().text();
        const condition = this.parseCondition(conditionText || '');

        const shippingText = $el.find('.shipping, [data-testid="shipping"]').first().text();
        const shipping = this.parseShipping(shippingText || '');

        items.push({
          title,
          url: url || searchUrl(source, query),
          currency: 'USD',
          metadata: { source: source.id, query },
          ...(price !== undefined ? { price } : {}),
          ...(image ? { image } : {}),
          ...(condition !== undefined ? { condition } : {}),
          ...(shipping !== undefined ? { shipping } : {}),
        });
      } catch {
        // Skip malformed items
      }
      return undefined;
    });

    return items;
  }
}

function searchUrl(source: MarketplaceSource, query: string): string {
  return source.baseUrl + source.searchPattern.replace('{query}', encodeURIComponent(query));
}

function timeout(): number {
  return ENV.SEARCH_TIMEOUT_MS || 30000;
}

// Adapter cache
const adapterCache = new Map<string, GenericWebAdapter>();

export class AdapterManager {
  static async getAdapter(adapterPath: string): Promise<BaseAdapter> {
    if (adapterCache.has(adapterPath)) {
      return adapterCache.get(adapterPath)!;
    }

    // Extract categories from adapter path
    const parts = adapterPath.split('/');
    const category = parts.length > 1 ? parts[1] : 'general';
    const adapterId = parts[parts.length - 1] || adapterPath;

    const adapter = new GenericWebAdapter(adapterId, [category]);
    adapterCache.set(adapterPath, adapter);

    return adapter;
  }

  static async searchSources(query: string, sources: string[]): Promise<SearchItem[]> {
    const results: SearchItem[] = [];

    for (const sourceId of sources) {
      const source = getSourceById(sourceId);
      if (!source) continue;

      try {
        const adapter = await this.getAdapter(source.adapter);
        const items = await adapter.search(query, {}, source);
        results.push(...items);
      } catch (error: any) {
        err('AdapterManager: Source search failed', { sourceId, error: error.message });
      }
    }

    return results;
  }

  static clearCache(): void {
    adapterCache.clear();
  }
}

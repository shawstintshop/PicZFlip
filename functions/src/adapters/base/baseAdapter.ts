import { MarketplaceSource } from '../../lib/sourceRegistry.js';

export interface SearchItem {
  title: string;
  price?: number;
  currency?: string;
  url: string;
  image?: string;
  condition?: string;
  seller?: string;
  location?: string;
  datePosted?: string;
  shipping?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseAdapter {
  abstract readonly adapterId: string;
  abstract readonly supportedCategories: string[];

  /**
   * Search for items matching the query
   */
  abstract search(query: string, itemData: any, source: MarketplaceSource): Promise<SearchItem[]>;

  /**
   * Validate that this adapter can handle the given source
   */
  canHandle(source: MarketplaceSource): boolean {
    return source.adapter.includes(this.adapterId);
  }

  /**
   * Normalize price string to number
   */
  protected parsePrice(priceText: string): number | undefined {
    if (!priceText) return undefined;
    
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(/,/g, ''));
    
    return isNaN(price) ? undefined : price;
  }

  /**
   * Make URL absolute
   */
  protected makeAbsoluteUrl(url: string, baseUrl: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return baseUrl + url;
    return baseUrl + '/' + url;
  }

  /**
   * Clean and normalize text
   */
  protected cleanText(text: string): string {
    return text?.trim().replace(/\s+/g, ' ') || '';
  }

  /**
   * Handle rate limiting
   */
  protected async respectRateLimit(source: MarketplaceSource): Promise<void> {
    const delayMs = Math.max(1000, 60000 / source.rateLimit);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Validate search parameters
   */
  protected validateSearchParams(query: string, itemData: any): void {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }
    
    if (query.length > 200) {
      throw new Error('Search query too long (max 200 characters)');
    }
  }

  /**
   * Extract condition from text
   */
  protected parseCondition(conditionText: string): string | undefined {
    if (!conditionText) return undefined;
    
    const text = conditionText.toLowerCase();
    
    if (text.includes('new') || text.includes('brand new')) return 'new';
    if (text.includes('like new') || text.includes('excellent')) return 'like_new';
    if (text.includes('good') || text.includes('very good')) return 'good';
    if (text.includes('fair') || text.includes('acceptable')) return 'fair';
    if (text.includes('poor') || text.includes('damaged')) return 'poor';
    if (text.includes('refurbished') || text.includes('reconditioned')) return 'refurbished';
    
    return 'unknown';
  }

  /**
   * Parse shipping information
   */
  protected parseShipping(shippingText: string): string | undefined {
    if (!shippingText) return undefined;
    
    const text = shippingText.toLowerCase();
    
    if (text.includes('free') || text.includes('no charge')) return 'free';
    if (text.includes('calculated') || text.includes('varies')) return 'calculated';
    if (text.includes('pickup') || text.includes('local')) return 'local_pickup';
    
    // Try to extract numeric value
    const match = text.match(/\$?(\d+\.?\d*)/);
    if (match) {
      return `$${match[1]}`;
    }
    
    return shippingText;
  }

  /**
   * Normalize currency
   */
  protected normalizeCurrency(currencyText: string): string {
    if (!currencyText) return 'USD';
    
    const text = currencyText.toUpperCase();
    
    if (text.includes('USD') || text.includes('$') || text.includes('DOLLAR')) return 'USD';
    if (text.includes('EUR') || text.includes('€') || text.includes('EURO')) return 'EUR';
    if (text.includes('GBP') || text.includes('£') || text.includes('POUND')) return 'GBP';
    if (text.includes('CAD') || text.includes('C$')) return 'CAD';
    if (text.includes('AUD') || text.includes('A$')) return 'AUD';
    
    return 'USD'; // Default to USD
  }

  /**
   * Generate search queries from item data
   */
  protected generateSearchQueries(itemData: any): string[] {
    const queries: string[] = [];
    
    if (itemData.name) {
      queries.push(itemData.name);
    }
    
    if (itemData.brand && itemData.model) {
      queries.push(`${itemData.brand} ${itemData.model}`);
    }
    
    if (itemData.category && itemData.name) {
      queries.push(`${itemData.category} ${itemData.name}`);
    }
    
    if (itemData.keywords && itemData.keywords.length > 0) {
      queries.push(...itemData.keywords);
    }
    
    // Remove duplicates and empty queries
    return [...new Set(queries)].filter(q => q.trim().length > 0);
  }

  /**
   * Log search attempt
   */
  protected logSearch(sourceId: string, query: string, resultCount: number): void {
    // This will be implemented by the logger
    console.log(`Search: ${sourceId} for "${query}" returned ${resultCount} results`);
  }
}

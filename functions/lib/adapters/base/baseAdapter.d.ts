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
export declare abstract class BaseAdapter {
    abstract readonly adapterId: string;
    abstract readonly supportedCategories: string[];
    /**
     * Search for items matching the query
     */
    abstract search(query: string, itemData: any, source: MarketplaceSource): Promise<SearchItem[]>;
    /**
     * Validate that this adapter can handle the given source
     */
    canHandle(source: MarketplaceSource): boolean;
    /**
     * Normalize price string to number
     */
    protected parsePrice(priceText: string): number | undefined;
    /**
     * Make URL absolute
     */
    protected makeAbsoluteUrl(url: string, baseUrl: string): string;
    /**
     * Clean and normalize text
     */
    protected cleanText(text: string): string;
    /**
     * Handle rate limiting
     */
    protected respectRateLimit(source: MarketplaceSource): Promise<void>;
    /**
     * Validate search parameters
     */
    protected validateSearchParams(query: string, _itemData?: any): void;
    /**
     * Extract condition from text
     */
    protected parseCondition(conditionText: string): string | undefined;
    /**
     * Parse shipping information
     */
    protected parseShipping(shippingText: string): string | undefined;
    /**
     * Normalize currency
     */
    protected normalizeCurrency(currencyText: string): string;
    /**
     * Generate search queries from item data
     */
    protected generateSearchQueries(itemData: any): string[];
    /**
     * Log search attempt
     */
    protected logSearch(sourceId: string, query: string, resultCount: number): void;
}
//# sourceMappingURL=baseAdapter.d.ts.map
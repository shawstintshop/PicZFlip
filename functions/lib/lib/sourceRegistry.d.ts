export interface MarketplaceSource {
    id: string;
    name: string;
    baseUrl: string;
    categories: string[];
    adapter: string;
    priority: number;
    rateLimit: number;
    hasApi: boolean;
    searchPattern: string;
    active: boolean;
    region?: string;
    specialties?: string[];
}
export declare const MARKETPLACE_SOURCES: MarketplaceSource[];
export declare function getSourcesByCategory(categories: string[], region?: string): MarketplaceSource[];
export declare function getAllActiveSources(): MarketplaceSource[];
export declare function getSourceById(id: string): MarketplaceSource | undefined;
export declare function getSourcesByPriority(minPriority: number): MarketplaceSource[];
export declare function getSourcesByRegion(region: string): MarketplaceSource[];
//# sourceMappingURL=sourceRegistry.d.ts.map
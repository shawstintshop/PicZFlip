import { VisionAnalysisResult } from './vision.js';
import { GeminiAnalysisResult } from './gemini.js';
export interface GrokConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export declare class GrokService {
    private apiKey;
    private model;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(config?: Partial<GrokConfig>);
    /**
     * Check if Grok service is available
     */
    isAvailable(): boolean;
    /**
     * Analyze product using Grok AI with Vision API data as context
     */
    analyzeProduct(imageBuffer: Buffer, visionResult: VisionAnalysisResult, userContext?: {
        knownBrand?: string;
        knownCategory?: string;
        additionalInfo?: string;
    }): Promise<GeminiAnalysisResult>;
    /**
     * Generate marketplace listing content
     */
    generateListingContent(analysis: GeminiAnalysisResult, platform: 'ebay' | 'amazon' | 'facebook' | 'mercari', customizations?: {
        condition?: string;
        priceRange?: {
            min: number;
            max: number;
        };
        shippingMethod?: string;
        returnPolicy?: string;
    }): Promise<{
        title: string;
        description: string;
        keywords: string[];
        categoryId: string;
        suggestedPrice: number;
    }>;
    /**
     * Make API request to Grok
     */
    private makeGrokRequest;
    private buildAnalysisPrompt;
    private buildListingPrompt;
    private getPlatformRequirements;
    private executeWithRetry;
    private parseGrokResponse;
    private parseListingResponse;
    private createFallbackAnalysis;
    private createFallbackListing;
}
export declare function getGrokService(): GrokService;
//# sourceMappingURL=grok.d.ts.map
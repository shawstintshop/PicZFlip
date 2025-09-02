import { VisionAnalysisResult } from './vision.js';
export interface GeminiAnalysisResult {
    productIdentification: {
        productName: string;
        brand: string;
        model: string;
        category: string;
        subcategory: string;
        confidence: number;
        reasoning: string;
    };
    marketingInfo: {
        suggestedTitle: string;
        description: string;
        keyFeatures: string[];
        condition: 'new' | 'used' | 'refurbished' | 'for-parts';
        estimatedAge: string;
    };
    pricingInsights: {
        estimatedValueRange: {
            low: number;
            high: number;
            currency: string;
        };
        factors: string[];
        comparableItems: string[];
    };
    listingOptimization: {
        recommendedKeywords: string[];
        categoryMapping: {
            ebay: string;
            amazon: string;
            facebook: string;
        };
        shippingNotes: string[];
    };
    metadata: {
        analysisVersion: string;
        processingTime: number;
        confidenceScore: number;
    };
}
export declare class GeminiService {
    private model;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor();
    /**
     * Analyze product using Gemini AI with Vision API data as context
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
    private buildAnalysisPrompt;
    private buildListingPrompt;
    private getPlatformRequirements;
    private executeWithRetry;
    private parseGeminiResponse;
    private parseListingResponse;
    private createFallbackAnalysis;
    private createFallbackListing;
}
export declare function getGeminiService(): GeminiService;
//# sourceMappingURL=gemini.d.ts.map
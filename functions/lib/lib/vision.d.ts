export interface VisionAnalysisResult {
    labels: Array<{
        description: string;
        score: number;
        confidence: number;
    }>;
    objects: Array<{
        name: string;
        score: number;
        boundingPoly: any;
    }>;
    text: {
        fullText: string;
        blocks: Array<{
            text: string;
            confidence: number;
        }>;
    };
    properties: {
        dominantColors: Array<{
            color: {
                red: number;
                green: number;
                blue: number;
            };
            score: number;
            pixelFraction: number;
        }>;
    };
    brands: Array<{
        description: string;
        score: number;
        boundingPoly: any;
    }>;
    metadata: {
        width: number;
        height: number;
        format: string;
        analysisTime: number;
    };
}
export declare class VisionService {
    private client;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor();
    /**
     * Analyze an image with comprehensive detection features
     */
    analyzeImage(imageBuffer: Buffer): Promise<VisionAnalysisResult>;
    /**
     * Rate-limited batch analysis for multiple images
     */
    analyzeImagesBatch(imageBuffers: Buffer[], concurrency?: number): Promise<VisionAnalysisResult[]>;
    /**
     * Execute a function with retry logic for transient failures
     */
    private executeWithRetry;
    private processLabels;
    private processObjects;
    private processText;
    private processImageProperties;
    private processBrands;
}
export declare function getVisionService(): VisionService;
export declare class VisionRateLimiter {
    private requests;
    private readonly maxRequestsPerMinute;
    constructor(maxRequestsPerMinute?: number);
    checkRateLimit(): Promise<void>;
}
export declare const visionRateLimiter: VisionRateLimiter;
//# sourceMappingURL=vision.d.ts.map
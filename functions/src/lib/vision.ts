import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ENV } from '../env.js';
import { log, err } from './logger.js';


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
      color: { red: number; green: number; blue: number };
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

export class VisionService {
  private client: ImageAnnotatorClient;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    // Initialize Google Cloud Vision client
    const options: any = {};
    
    if (ENV.GOOGLE_APPLICATION_CREDENTIALS) {
      options.keyFilename = ENV.GOOGLE_APPLICATION_CREDENTIALS;
    } else if (ENV.GOOGLE_VISION_API_KEY) {
      options.apiKey = ENV.GOOGLE_VISION_API_KEY;
    }

    this.client = new ImageAnnotatorClient(options);
  }

  /**
   * Analyze an image with comprehensive detection features
   */
  async analyzeImage(imageBuffer: Buffer): Promise<VisionAnalysisResult> {
    const startTime = Date.now();
    
    try {
      log('Starting Google Cloud Vision analysis', { 
        imageSize: imageBuffer.length,
        timestamp: new Date().toISOString()
      });

      // Validate image size (max 10MB as per env config)
      const maxSizeBytes = ENV.MAX_IMAGE_SIZE_MB * 1024 * 1024;
      if (imageBuffer.length > maxSizeBytes) {
        throw new Error(`Image size ${imageBuffer.length} exceeds maximum allowed size of ${maxSizeBytes} bytes`);
      }

      // Batch multiple detection types for efficiency
      const request = {
        image: { content: imageBuffer },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
          { type: 'TEXT_DETECTION', maxResults: 1 },
          { type: 'IMAGE_PROPERTIES', maxResults: 1 },
          { type: 'LOGO_DETECTION', maxResults: 10 },
          { type: 'PRODUCT_SEARCH', maxResults: 10 }
        ],
        imageContext: {
          cropHintsParams: {
            aspectRatios: [0.8, 1.0, 1.2]
          }
        }
      };

      const [result] = await this.executeWithRetry(() => 
        this.client.annotateImage(request)
      );

      if (!result) {
        throw new Error('No analysis result received from Google Cloud Vision');
      }

      const analysisTime = Date.now() - startTime;

      // Process and structure the results
      const analysis: VisionAnalysisResult = {
        labels: this.processLabels(result.labelAnnotations || []),
        objects: this.processObjects(result.localizedObjectAnnotations || []),
        text: this.processText(result.textAnnotations || []),
        properties: this.processImageProperties(result.imagePropertiesAnnotation),
        brands: this.processBrands(result.logoAnnotations || []),
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          analysisTime
        }
      };

      // Extract image metadata if available
      if (result.imagePropertiesAnnotation) {
        // Note: Google Vision doesn't directly provide image dimensions
        // This would typically come from image processing before Vision API
        analysis.metadata.width = 0; // Would be set by image processor
        analysis.metadata.height = 0; // Would be set by image processor
      }

      log('Google Cloud Vision analysis completed', {
        analysisTime,
        labelsFound: analysis.labels.length,
        objectsFound: analysis.objects.length,
        textFound: analysis.text.fullText.length > 0,
        brandsFound: analysis.brands.length
      });

      return analysis;

    } catch (error: any) {
      const analysisTime = Date.now() - startTime;
      const permissionDenied =
        error?.code === 7 ||
        error?.code === 403 ||
        error?.status === 'PERMISSION_DENIED' ||
        /PERMISSION_DENIED|permission denied/.test(error?.message || '');

      if (permissionDenied) {
        err('Google Cloud Vision permission error', {
          error: error.message,
          analysisTime,
          imageSize: imageBuffer.length
        });

        throw new Error(
          'Vision analysis failed: permission denied. Enable the Cloud Vision API and grant the service account Vision permissions in Google Cloud Console.'
        );
      }

      err('Google Cloud Vision analysis failed', {
        error: error.message,
        stack: error.stack,
        analysisTime,
        imageSize: imageBuffer.length
      });

      // Re-throw with additional context
      throw new Error(`Vision analysis failed: ${error.message}`);
    }
  }

  /**
   * Rate-limited batch analysis for multiple images
   */
  async analyzeImagesBatch(imageBuffers: Buffer[], concurrency = 3): Promise<VisionAnalysisResult[]> {
    log('Starting batch vision analysis', { 
      imageCount: imageBuffers.length,
      concurrency 
    });

    const results: VisionAnalysisResult[] = [];
    const errors: Error[] = [];

    // Process in batches to respect rate limits
    for (let i = 0; i < imageBuffers.length; i += concurrency) {
      const batch = imageBuffers.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (buffer, index) => {
        try {
          const result = await this.analyzeImage(buffer);
          return { index: i + index, result, error: null };
        } catch (error: any) {
          return { index: i + index, result: null, error };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const { index, result, error } of batchResults) {
        if (result) {
          results[index] = result;
        } else {
          errors.push(error);
          err(`Batch analysis failed for image ${index}`, error);
        }
      }

      // Add delay between batches to respect rate limits
      if (i + concurrency < imageBuffers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    log('Batch vision analysis completed', {
      successCount: results.filter(r => r).length,
      errorCount: errors.length
    });

    return results;
  }

  /**
   * Execute a function with retry logic for transient failures
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on authentication or quota errors
        if (error.code === 7 || error.code === 8 || error.code === 16) {
          throw error;
        }

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          log(`Vision API retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`, {
            error: error.message
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private processLabels(annotations: any[]): VisionAnalysisResult['labels'] {
    return annotations.map(annotation => ({
      description: annotation.description || '',
      score: annotation.score || 0,
      confidence: Math.round((annotation.score || 0) * 100)
    })).filter(label => label.score > 0.1); // Filter low-confidence labels
  }

  private processObjects(annotations: any[]): VisionAnalysisResult['objects'] {
    return annotations.map(annotation => ({
      name: annotation.name || '',
      score: annotation.score || 0,
      boundingPoly: annotation.boundingPoly || null
    })).filter(obj => obj.score > 0.3); // Filter low-confidence objects
  }

  private processText(annotations: any[]): VisionAnalysisResult['text'] {
    if (!annotations || annotations.length === 0) {
      return { fullText: '', blocks: [] };
    }

    const fullText = annotations[0]?.description || '';
    const blocks = annotations.slice(1).map(annotation => ({
      text: annotation.description || '',
      confidence: Math.round((annotation.confidence || 0) * 100)
    }));

    return { fullText, blocks };
  }

  private processImageProperties(properties: any): VisionAnalysisResult['properties'] {
    if (!properties || !properties.dominantColors) {
      return { dominantColors: [] };
    }

    return {
      dominantColors: (properties.dominantColors.colors || []).map((color: any) => ({
        color: {
          red: color.color?.red || 0,
          green: color.color?.green || 0,
          blue: color.color?.blue || 0
        },
        score: color.score || 0,
        pixelFraction: color.pixelFraction || 0
      }))
    };
  }

  private processBrands(annotations: any[]): VisionAnalysisResult['brands'] {
    return annotations.map(annotation => ({
      description: annotation.description || '',
      score: annotation.score || 0,
      boundingPoly: annotation.boundingPoly || null
    })).filter(brand => brand.score > 0.5); // Higher threshold for brand detection
  }
}

// Singleton instance for reuse across function calls
let visionServiceInstance: VisionService | null = null;

export function getVisionService(): VisionService {
  if (!visionServiceInstance) {
    visionServiceInstance = new VisionService();
  }
  return visionServiceInstance;
}

// Rate limiting helper
export class VisionRateLimiter {
  private requests: number[] = [];
  private readonly maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute = 1000) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove requests older than 1 minute
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);

    if (this.requests.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 60000 - (now - oldestRequest);
      
      log(`Rate limit reached, waiting ${waitTime}ms`, {
        currentRequests: this.requests.length,
        maxRequests: this.maxRequestsPerMinute
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkRateLimit(); // Recursive check after waiting
    }

    this.requests.push(now);
  }
}

export const visionRateLimiter = new VisionRateLimiter(ENV.MAX_REQUESTS_PER_MINUTE);

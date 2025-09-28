import { getVisionService } from '../../lib/vision.js';
import { log, err } from '../../lib/logger.js';

// Dynamically import Firebase AI or fallback to Gemini
let useFirebaseAI = true;
let firebaseAIService: any = null;
let geminiService: any = null;

async function getAIService() {
  if (useFirebaseAI && !firebaseAIService) {
    try {
      const { getFirebaseAIService } = await import('../../lib/firebaseAI.js');
      firebaseAIService = getFirebaseAIService();
      log('Using Firebase AI Logic');
      return firebaseAIService;
    } catch (error: any) {
      err('Firebase AI not available, falling back to direct Gemini', { error: error.message });
      useFirebaseAI = false;
    }
  }
  
  if (!geminiService) {
    try {
      const { getGeminiService } = await import('../../lib/gemini.js');
      geminiService = getGeminiService();
      log('Using direct Gemini AI');
      return geminiService;
    } catch (error: any) {
      err('Both Firebase AI and Gemini services failed', { error: error.message });
      throw error;
    }
  }
  
  return useFirebaseAI ? firebaseAIService : geminiService;
}

// Enhanced Identifier Agent using Vision + Gemini AI
export const identifierAgent = {
  async identifyItem(imageBuffer: Buffer): Promise<{ 
    category: string; 
    confidence: number; 
    details: any;
    productName: string;
    brand: string;
    estimatedValue: { low: number; high: number; currency: string };
    marketingInfo: any;
  }> {
    try {
      log('Starting comprehensive item identification');

      // Step 1: Vision API Analysis
      const visionService = getVisionService();
      const visionResult = await visionService.analyzeImage(imageBuffer);

      // Step 2: AI Analysis (Firebase AI Logic or Gemini fallback)
      const aiService = await getAIService();
      const geminiResult = await aiService.analyzeProduct(imageBuffer, visionResult);

      // Convert to legacy format for compatibility
      return {
        category: geminiResult.productIdentification.category,
        confidence: geminiResult.productIdentification.confidence / 100, // Convert to 0-1 scale
        productName: geminiResult.productIdentification.productName,
        brand: geminiResult.productIdentification.brand,
        estimatedValue: geminiResult.pricingInsights.estimatedValueRange,
        marketingInfo: geminiResult.marketingInfo,
        details: {
          description: geminiResult.marketingInfo.description,
          visionLabels: visionResult.labels,
          visionObjects: visionResult.objects,
          visionText: visionResult.text.fullText,
          visionBrands: visionResult.brands,
          fullGeminiResult: geminiResult,
          fullVisionResult: visionResult
        }
      };
    } catch (error: any) {
      err('Enhanced identification failed, falling back to basic detection', error);
      
      // Fallback to basic Vision-only analysis
      try {
        const visionService = getVisionService();
        const visionResult = await visionService.analyzeImage(imageBuffer);
        
        const topLabel = visionResult.labels[0];
        const topObject = visionResult.objects[0];
        const detectedBrand = visionResult.brands[0];

        return {
          category: topLabel?.description || 'general',
          confidence: Math.max(
            topLabel?.confidence || 0,
            topObject?.score ? topObject.score * 100 : 0
          ) / 100,
          productName: topObject?.name || topLabel?.description || 'Unknown Item',
          brand: detectedBrand?.description || 'Unknown',
          estimatedValue: { low: 10, high: 50, currency: 'USD' },
          marketingInfo: {
            suggestedTitle: `${detectedBrand?.description || ''} ${topObject?.name || topLabel?.description || 'Item'}`.trim(),
            description: `Quality pre-owned ${topLabel?.description || 'item'} in good condition.`,
            condition: 'used'
          },
          details: {
            description: `Detected: ${topLabel?.description || 'Unknown item'}`,
            visionLabels: visionResult.labels,
            visionObjects: visionResult.objects,
            visionText: visionResult.text.fullText,
            visionBrands: visionResult.brands,
            fullVisionResult: visionResult,
            analysisType: 'vision-only-fallback'
          }
        };
      } catch (fallbackError: any) {
        err('Vision fallback also failed', fallbackError);
        
        // Final fallback to basic response
        return {
          category: 'general',
          confidence: 0.3,
          productName: 'Unknown Item',
          brand: 'Unknown',
          estimatedValue: { low: 5, high: 25, currency: 'USD' },
          marketingInfo: {
            suggestedTitle: 'Item for Sale',
            description: 'Please add description and details.',
            condition: 'used'
          },
          details: { 
            description: 'Unable to analyze image - please check image quality and try again',
            error: fallbackError.message,
            analysisType: 'failed-fallback'
          }
        };
      }
    }
  },
  
  async identifyFromPhoto(imageBuffer: Buffer): Promise<any> {
    const result = await this.identifyItem(imageBuffer);
    return {
      category: result.category,
      details: result.details,
      confidence: result.confidence,
      productName: result.productName,
      brand: result.brand,
      estimatedValue: result.estimatedValue,
      marketingInfo: result.marketingInfo,
      // Add comprehensive product information
      productIdentification: {
        productName: result.productName,
        brand: result.brand,
        category: result.category,
        confidence: result.confidence * 100 // Convert back to 0-100 scale
      },
      pricingInsights: {
        estimatedValueRange: result.estimatedValue,
        factors: ['Condition assessment', 'Market research needed'],
        comparableItems: []
      }
    };
  }
};
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { log, err } from './logger.js';
import { VisionAnalysisResult } from './vision.js';
import { ENV } from '../env.js';

export interface FirebaseAIAnalysisResult {
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
    defects: string[];
  };
  pricingInsights: {
    estimatedValueRange: {
      low: number;
      high: number;
      currency: string;
    };
    priceFactors: string[];
    marketTrends: string;
    recommendation: 'buy' | 'pass' | 'research';
  };
  metadata: {
    confidenceScore: number;
    processingTime: number;
    modelVersion: string;
    timestamp: Date;
  };
}

export class FirebaseAIService {
  private ai: any;
  private model: any;

  constructor() {
    try {
      // For Cloud Functions, we need to use the client SDK for Firebase AI
      // Initialize a client app for AI Logic
      const projectId = admin.app().options.projectId;
      if (!projectId) {
        throw new Error('Firebase project ID not found');
      }
      
      const firebaseConfig = {
        apiKey: ENV.GEMINI_API_KEY, // Use Gemini API key for Firebase AI
        projectId: projectId
      };
      
      const clientApp = initializeApp(firebaseConfig, 'ai-client');
      this.ai = getAI(clientApp, { backend: new GoogleAIBackend() });
      this.model = getGenerativeModel(this.ai, { model: "gemini-2.0-flash-exp" });
      
      log('Firebase AI Logic initialized successfully');
    } catch (error: any) {
      err('Failed to initialize Firebase AI Logic', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze product using Firebase AI Logic with Gemini
   */
  async analyzeProduct(
    imageBuffer: Buffer,
    visionResult: VisionAnalysisResult,
    userContext?: any
  ): Promise<FirebaseAIAnalysisResult> {
    const startTime = Date.now();

    try {
      log('Starting Firebase AI product analysis', {
        visionLabels: visionResult.labels.length,
        visionObjects: visionResult.objects.length,
        hasUserContext: !!userContext
      });

      // Prepare the analysis prompt
      const prompt = this.buildAnalysisPrompt(visionResult, userContext);

      // Convert image buffer to base64 for Gemini
      const imageBase64 = imageBuffer.toString('base64');

      // Send request to Gemini via Firebase AI Logic
      const result = await this.model.generateContent([
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        }
      ]);

      const response = result.response;
      const text = response.text();

      // Parse the structured response
      const analysis = this.parseGeminiResponse(text);

      const processingTime = Date.now() - startTime;

      const finalResult: FirebaseAIAnalysisResult = {
        ...analysis,
        metadata: {
          ...analysis.metadata,
          processingTime,
          modelVersion: 'gemini-2.0-flash-exp',
          timestamp: new Date()
        }
      };

      log('Firebase AI analysis completed', {
        processingTime,
        productName: finalResult.productIdentification.productName,
        confidence: finalResult.productIdentification.confidence
      });

      return finalResult;

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      err('Firebase AI analysis failed', {
        error: error.message,
        processingTime
      });
      throw error;
    }
  }

  /**
   * Generate platform-specific listing content
   */
  async generateListingContent(
    analysis: FirebaseAIAnalysisResult,
    platform: 'ebay' | 'amazon' | 'facebook' | 'craigslist' | 'offerup' | 'mercari',
    customizations?: {
      condition?: string;
      priceRange?: { min: number; max: number };
      shippingMethod?: string;
      returnPolicy?: string;
    }
  ): Promise<{
    title: string;
    description: string;
    keywords: string[];
    suggestedPrice: number;
    category: string;
  }> {
    try {
      log(`Generating ${platform} listing`, {
        productName: analysis.productIdentification.productName
      });

      const prompt = this.buildListingPrompt(analysis, platform, customizations);

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseListingResponse(text, analysis);

    } catch (error: any) {
      err(`Failed to generate ${platform} listing`, {
        error: error.message,
        productName: analysis.productIdentification.productName
      });
      throw error;
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(visionResult: VisionAnalysisResult, userContext?: any): string {
    const visionData = {
      labels: visionResult.labels.map(l => l.description).join(', '),
      objects: visionResult.objects.map(o => o.name).join(', '),
      text: visionResult.text.fullText,
      brands: visionResult.brands.map(b => b.description).join(', ')
    };

    return `
You are an expert product analyst and marketplace consultant. Analyze this product image and provide detailed insights.

VISION API DATA:
- Detected Labels: ${visionData.labels}
- Detected Objects: ${visionData.objects}
- Text in Image: ${visionData.text}
- Detected Brands: ${visionData.brands}

${userContext ? `USER CONTEXT: ${JSON.stringify(userContext)}` : ''}

Please provide a comprehensive analysis in the following JSON format:

{
  "productIdentification": {
    "productName": "Full product name with brand and model",
    "brand": "Brand name",
    "model": "Model number or name",
    "category": "Primary category",
    "subcategory": "Specific subcategory",
    "confidence": 85,
    "reasoning": "Why you identified it this way"
  },
  "marketingInfo": {
    "suggestedTitle": "Optimized listing title",
    "description": "Detailed product description",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "condition": "used",
    "estimatedAge": "Age estimate",
    "defects": ["any visible issues"]
  },
  "pricingInsights": {
    "estimatedValueRange": {
      "low": 100,
      "high": 200,
      "currency": "USD"
    },
    "priceFactors": ["factors affecting price"],
    "marketTrends": "Current market analysis",
    "recommendation": "buy"
  },
  "metadata": {
    "confidenceScore": 85
  }
}

Focus on accuracy and provide realistic pricing based on current market conditions.
`;
  }

  /**
   * Build platform-specific listing prompt
   */
  private buildListingPrompt(
    analysis: FirebaseAIAnalysisResult,
    platform: string,
    customizations?: any
  ): string {
    const platformGuidelines = {
      ebay: 'eBay format: detailed, keyword-rich, auction-optimized',
      amazon: 'Amazon format: brand/model focus, feature bullets, competitive',
      facebook: 'Facebook Marketplace: casual, local focus, conversational',
      craigslist: 'Craigslist: straightforward, no-nonsense, local sales',
      offerup: 'OfferUp: mobile-first, quick browsing, local deals',
      mercari: 'Mercari: trendy, shipping-focused, social commerce'
    };

    return `
Create an optimized listing for ${platform} based on this product analysis:

PRODUCT: ${analysis.productIdentification.productName}
BRAND: ${analysis.productIdentification.brand}
CATEGORY: ${analysis.productIdentification.category}
CONDITION: ${analysis.marketingInfo.condition}
ESTIMATED VALUE: $${analysis.pricingInsights.estimatedValueRange.low}-${analysis.pricingInsights.estimatedValueRange.high}

PLATFORM GUIDELINES: ${platformGuidelines[platform as keyof typeof platformGuidelines]}

${customizations ? `CUSTOMIZATIONS: ${JSON.stringify(customizations)}` : ''}

Return JSON format:
{
  "title": "Optimized title for ${platform}",
  "description": "Platform-specific description",
  "keywords": ["relevant", "keywords"],
  "suggestedPrice": 150,
  "category": "appropriate category"
}
`;
  }

  /**
   * Parse Gemini analysis response
   */
  private parseGeminiResponse(text: string): FirebaseAIAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        productIdentification: {
          productName: parsed.productIdentification?.productName || 'Unknown Product',
          brand: parsed.productIdentification?.brand || 'Unknown',
          model: parsed.productIdentification?.model || '',
          category: parsed.productIdentification?.category || 'General',
          subcategory: parsed.productIdentification?.subcategory || '',
          confidence: parsed.productIdentification?.confidence || 50,
          reasoning: parsed.productIdentification?.reasoning || ''
        },
        marketingInfo: {
          suggestedTitle: parsed.marketingInfo?.suggestedTitle || parsed.productIdentification?.productName || 'Item for Sale',
          description: parsed.marketingInfo?.description || 'Quality pre-owned item in good condition.',
          keyFeatures: parsed.marketingInfo?.keyFeatures || [],
          condition: parsed.marketingInfo?.condition || 'used',
          estimatedAge: parsed.marketingInfo?.estimatedAge || 'Unknown',
          defects: parsed.marketingInfo?.defects || []
        },
        pricingInsights: {
          estimatedValueRange: {
            low: parsed.pricingInsights?.estimatedValueRange?.low || 10,
            high: parsed.pricingInsights?.estimatedValueRange?.high || 50,
            currency: parsed.pricingInsights?.estimatedValueRange?.currency || 'USD'
          },
          priceFactors: parsed.pricingInsights?.priceFactors || [],
          marketTrends: parsed.pricingInsights?.marketTrends || '',
          recommendation: parsed.pricingInsights?.recommendation || 'research'
        },
        metadata: {
          confidenceScore: parsed.metadata?.confidenceScore || 50,
          processingTime: 0, // Will be set by caller
          modelVersion: 'gemini-2.0-flash-exp',
          timestamp: new Date()
        }
      };

    } catch (error: any) {
      err('Failed to parse Gemini response', { error: error.message, text });
      
      // Return fallback response
      return {
        productIdentification: {
          productName: 'Unknown Product',
          brand: 'Unknown',
          model: '',
          category: 'General',
          subcategory: '',
          confidence: 30,
          reasoning: 'Failed to parse AI response'
        },
        marketingInfo: {
          suggestedTitle: 'Item for Sale',
          description: 'Please add description manually.',
          keyFeatures: [],
          condition: 'used',
          estimatedAge: 'Unknown',
          defects: []
        },
        pricingInsights: {
          estimatedValueRange: {
            low: 5,
            high: 25,
            currency: 'USD'
          },
          priceFactors: [],
          marketTrends: '',
          recommendation: 'research'
        },
        metadata: {
          confidenceScore: 30,
          processingTime: 0,
          modelVersion: 'gemini-2.0-flash-exp',
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Parse listing generation response
   */
  private parseListingResponse(text: string, analysis: FirebaseAIAnalysisResult): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in listing response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || analysis.marketingInfo.suggestedTitle,
        description: parsed.description || analysis.marketingInfo.description,
        keywords: parsed.keywords || [analysis.productIdentification.brand, analysis.productIdentification.category],
        suggestedPrice: parsed.suggestedPrice || Math.round((analysis.pricingInsights.estimatedValueRange.low + analysis.pricingInsights.estimatedValueRange.high) / 2),
        category: parsed.category || analysis.productIdentification.category
      };

    } catch (error: any) {
      err('Failed to parse listing response', { error: error.message, text });
      
      // Return fallback
      return {
        title: analysis.marketingInfo.suggestedTitle,
        description: analysis.marketingInfo.description,
        keywords: [analysis.productIdentification.brand, analysis.productIdentification.category],
        suggestedPrice: Math.round((analysis.pricingInsights.estimatedValueRange.low + analysis.pricingInsights.estimatedValueRange.high) / 2),
        category: analysis.productIdentification.category
      };
    }
  }
}

// Singleton instance
let firebaseAIServiceInstance: FirebaseAIService | null = null;

export function getFirebaseAIService(): FirebaseAIService {
  if (!firebaseAIServiceInstance) {
    firebaseAIServiceInstance = new FirebaseAIService();
  }
  return firebaseAIServiceInstance;
}
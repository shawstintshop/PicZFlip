import { log, err } from './logger.js';
export class GrokService {
    apiKey;
    model;
    maxRetries = 3;
    retryDelay = 2000;
    constructor(config) {
        this.apiKey = config?.apiKey || process.env.GROK_API_KEY || '';
        this.model = config?.model || 'grok-1';
        if (!this.apiKey) {
            log('Warning: GROK_API_KEY not set. Grok service will not be available.');
        }
    }
    /**
     * Check if Grok service is available
     */
    isAvailable() {
        return !!this.apiKey;
    }
    /**
     * Analyze product using Grok AI with Vision API data as context
     */
    async analyzeProduct(imageBuffer, visionResult, userContext) {
        if (!this.isAvailable()) {
            throw new Error('Grok API key not configured. Please set GROK_API_KEY environment variable.');
        }
        const startTime = Date.now();
        try {
            log('Starting Grok AI product analysis', {
                visionLabels: visionResult.labels.length,
                visionObjects: visionResult.objects.length,
                hasText: visionResult.text.fullText.length > 0,
                hasBrands: visionResult.brands.length > 0
            });
            // Prepare the analysis request
            const prompt = this.buildAnalysisPrompt(visionResult, userContext);
            const base64Image = imageBuffer.toString('base64');
            // Execute the analysis with retry logic
            const result = await this.executeWithRetry(async () => {
                return await this.makeGrokRequest(prompt, base64Image);
            });
            // Parse the structured response
            const analysis = this.parseGrokResponse(result);
            const processingTime = Date.now() - startTime;
            analysis.metadata.processingTime = processingTime;
            log('Grok AI analysis completed', {
                processingTime,
                productName: analysis.productIdentification.productName,
                confidence: analysis.productIdentification.confidence,
                estimatedValue: analysis.pricingInsights.estimatedValueRange
            });
            return analysis;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            err('Grok AI analysis failed', {
                error: error.message,
                stack: error.stack,
                processingTime
            });
            // Return fallback analysis based on Vision data
            return this.createFallbackAnalysis(visionResult, processingTime);
        }
    }
    /**
     * Generate marketplace listing content
     */
    async generateListingContent(analysis, platform, customizations) {
        if (!this.isAvailable()) {
            throw new Error('Grok API key not configured.');
        }
        try {
            log('Generating listing content for platform with Grok', { platform });
            const prompt = this.buildListingPrompt(analysis, platform, customizations);
            const result = await this.executeWithRetry(async () => {
                return await this.makeGrokRequest(prompt, null);
            });
            return this.parseListingResponse(result, platform);
        }
        catch (error) {
            err('Grok listing generation failed', { error: error.message, platform });
            // Return basic listing based on analysis data
            return this.createFallbackListing(analysis, platform);
        }
    }
    /**
     * Make API request to Grok
     */
    async makeGrokRequest(prompt, base64Image) {
        // Placeholder implementation
        // This would need to be updated based on actual Grok API documentation
        const payload = {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        // Add image if provided
        if (base64Image) {
            payload.messages[0].content = [
                { type: 'text', text: prompt },
                { type: 'image', image: base64Image }
            ];
        }
        // Note: This is a placeholder. Actual implementation depends on Grok API specs
        log('Making Grok API request (placeholder)', { hasImage: !!base64Image });
        // For now, throw an error to indicate this needs implementation
        throw new Error('Grok API integration pending. Please implement the actual API call based on Grok documentation.');
    }
    buildAnalysisPrompt(visionResult, userContext) {
        const contextInfo = [
            `Vision API detected labels: ${visionResult.labels.map(l => `${l.description} (${l.confidence}%)`).join(', ')}`,
            `Detected objects: ${visionResult.objects.map(o => `${o.name} (${Math.round(o.score * 100)}%)`).join(', ')}`,
            visionResult.text.fullText ? `Visible text: "${visionResult.text.fullText}"` : '',
            `Detected brands: ${visionResult.brands.map(b => `${b.description} (${Math.round(b.score * 100)}%)`).join(', ')}`,
            userContext?.knownBrand ? `User-specified brand: ${userContext.knownBrand}` : '',
            userContext?.knownCategory ? `User-specified category: ${userContext.knownCategory}` : '',
            userContext?.additionalInfo ? `Additional context: ${userContext.additionalInfo}` : ''
        ].filter(Boolean).join('\n');
        return `
You are an expert product identification and marketplace listing specialist. Analyze this product image and provide detailed insights for resale purposes.

Context from Google Vision API:
${contextInfo}

Please analyze the image and provide a comprehensive product assessment in the following JSON format:

{
  "productIdentification": {
    "productName": "Specific product name with model/version if identifiable",
    "brand": "Brand name",
    "model": "Model number or specific variant",
    "category": "Primary product category",
    "subcategory": "More specific subcategory",
    "confidence": 85,
    "reasoning": "Explanation of how you identified this product"
  },
  "marketingInfo": {
    "suggestedTitle": "Optimized listing title (80 chars max)",
    "description": "Detailed product description highlighting key selling points",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "condition": "new|used|refurbished|for-parts",
    "estimatedAge": "Approximate age or release timeframe"
  },
  "pricingInsights": {
    "estimatedValueRange": {
      "low": 50,
      "high": 100,
      "currency": "USD"
    },
    "factors": ["factors affecting price"],
    "comparableItems": ["similar products to research"]
  },
  "listingOptimization": {
    "recommendedKeywords": ["seo", "keywords", "for", "search"],
    "categoryMapping": {
      "ebay": "eBay category path",
      "amazon": "Amazon category",
      "facebook": "Facebook Marketplace category"
    },
    "shippingNotes": ["Important shipping considerations"]
  }
}

Focus on accuracy and provide realistic price estimates based on current market conditions. If uncertain about any aspect, indicate lower confidence and explain your reasoning.
`;
    }
    buildListingPrompt(analysis, platform, customizations) {
        return `
Create an optimized marketplace listing for ${platform} based on this product analysis:

Product: ${analysis.productIdentification.productName}
Brand: ${analysis.productIdentification.brand}
Category: ${analysis.productIdentification.category}
Condition: ${customizations?.condition || analysis.marketingInfo.condition}
Price Range: $${customizations?.priceRange?.min || analysis.pricingInsights.estimatedValueRange.low} - $${customizations?.priceRange?.max || analysis.pricingInsights.estimatedValueRange.high}

Platform-specific requirements for ${platform}:
${this.getPlatformRequirements(platform)}

Generate a JSON response with:
{
  "title": "Platform-optimized title",
  "description": "Compelling product description with key selling points",
  "keywords": ["relevant", "search", "terms"],
  "categoryId": "appropriate category identifier",
  "suggestedPrice": 75
}

Make the listing compelling while staying accurate and following ${platform} best practices.
`;
    }
    getPlatformRequirements(platform) {
        const requirements = {
            ebay: 'eBay: 80 char title limit, detailed condition description, return policy mention',
            amazon: 'Amazon: Focus on brand/model in title, bullet points for features, competitive pricing',
            facebook: 'Facebook: Casual tone, local pickup options, honest condition assessment',
            mercari: 'Mercari: Clear photos mention, fair pricing, shipping options'
        };
        return requirements[platform] || 'Standard marketplace listing format';
    }
    async executeWithRetry(fn) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                // Don't retry on authentication errors
                if (error.message?.includes('API_KEY') || error.status === 401) {
                    throw error;
                }
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * attempt;
                    log(`Grok API retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`, {
                        error: error.message
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    parseGrokResponse(response) {
        try {
            // Extract JSON from response (remove any markdown formatting)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate required fields and provide defaults
            return {
                productIdentification: {
                    productName: parsed.productIdentification?.productName || 'Unknown Product',
                    brand: parsed.productIdentification?.brand || 'Unknown',
                    model: parsed.productIdentification?.model || '',
                    category: parsed.productIdentification?.category || 'General',
                    subcategory: parsed.productIdentification?.subcategory || '',
                    confidence: Math.min(100, Math.max(0, parsed.productIdentification?.confidence || 50)),
                    reasoning: parsed.productIdentification?.reasoning || 'Grok AI automated analysis'
                },
                marketingInfo: {
                    suggestedTitle: parsed.marketingInfo?.suggestedTitle || parsed.productIdentification?.productName || 'Item for Sale',
                    description: parsed.marketingInfo?.description || 'Quality pre-owned item in good condition.',
                    keyFeatures: Array.isArray(parsed.marketingInfo?.keyFeatures) ? parsed.marketingInfo.keyFeatures : [],
                    condition: ['new', 'used', 'refurbished', 'for-parts'].includes(parsed.marketingInfo?.condition)
                        ? parsed.marketingInfo.condition : 'used',
                    estimatedAge: parsed.marketingInfo?.estimatedAge || 'Unknown age'
                },
                pricingInsights: {
                    estimatedValueRange: {
                        low: Math.max(1, parsed.pricingInsights?.estimatedValueRange?.low || 10),
                        high: Math.max(1, parsed.pricingInsights?.estimatedValueRange?.high || 50),
                        currency: parsed.pricingInsights?.estimatedValueRange?.currency || 'USD'
                    },
                    factors: Array.isArray(parsed.pricingInsights?.factors) ? parsed.pricingInsights.factors : [],
                    comparableItems: Array.isArray(parsed.pricingInsights?.comparableItems) ? parsed.pricingInsights.comparableItems : []
                },
                listingOptimization: {
                    recommendedKeywords: Array.isArray(parsed.listingOptimization?.recommendedKeywords)
                        ? parsed.listingOptimization.recommendedKeywords : [],
                    categoryMapping: parsed.listingOptimization?.categoryMapping || {
                        ebay: 'Other',
                        amazon: 'Other',
                        facebook: 'Other'
                    },
                    shippingNotes: Array.isArray(parsed.listingOptimization?.shippingNotes)
                        ? parsed.listingOptimization.shippingNotes : []
                },
                metadata: {
                    analysisVersion: '1.0.0-grok',
                    processingTime: 0, // Will be set by caller
                    confidenceScore: parsed.productIdentification?.confidence || 50
                }
            };
        }
        catch (error) {
            err('Failed to parse Grok response', { error: error.message, response });
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }
    parseListingResponse(response, _platform) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in listing response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title || 'Item for Sale',
                description: parsed.description || 'Quality item in good condition.',
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
                categoryId: parsed.categoryId || 'other',
                suggestedPrice: Math.max(1, parsed.suggestedPrice || 10)
            };
        }
        catch (error) {
            err('Failed to parse listing response', { error: error.message, response });
            throw new Error(`Failed to parse listing response: ${error.message}`);
        }
    }
    createFallbackAnalysis(visionResult, processingTime) {
        const topLabel = visionResult.labels[0];
        const topObject = visionResult.objects[0];
        const detectedBrand = visionResult.brands[0];
        return {
            productIdentification: {
                productName: topObject?.name || topLabel?.description || 'Unknown Item',
                brand: detectedBrand?.description || 'Unknown',
                model: '',
                category: topLabel?.description || 'General',
                subcategory: '',
                confidence: Math.max(topLabel?.confidence || 0, topObject?.score ? Math.round(topObject.score * 100) : 0),
                reasoning: 'Fallback analysis based on computer vision detection (Grok unavailable)'
            },
            marketingInfo: {
                suggestedTitle: `${detectedBrand?.description || ''} ${topObject?.name || topLabel?.description || 'Item'}`.trim(),
                description: `Quality pre-owned ${topLabel?.description || 'item'} in good condition.`,
                keyFeatures: visionResult.labels.slice(0, 3).map(l => l.description),
                condition: 'used',
                estimatedAge: 'Unknown age'
            },
            pricingInsights: {
                estimatedValueRange: {
                    low: 10,
                    high: 50,
                    currency: 'USD'
                },
                factors: ['Condition assessment needed', 'Market research required'],
                comparableItems: []
            },
            listingOptimization: {
                recommendedKeywords: visionResult.labels.slice(0, 5).map(l => l.description.toLowerCase()),
                categoryMapping: {
                    ebay: 'Other',
                    amazon: 'Other',
                    facebook: 'Other'
                },
                shippingNotes: ['Standard packaging recommended']
            },
            metadata: {
                analysisVersion: '1.0.0-grok-fallback',
                processingTime,
                confidenceScore: 30
            }
        };
    }
    createFallbackListing(analysis, _platform) {
        return {
            title: analysis.marketingInfo.suggestedTitle.substring(0, 80),
            description: analysis.marketingInfo.description,
            keywords: analysis.listingOptimization.recommendedKeywords,
            categoryId: 'other',
            suggestedPrice: Math.round((analysis.pricingInsights.estimatedValueRange.low + analysis.pricingInsights.estimatedValueRange.high) / 2)
        };
    }
}
// Singleton instance
let grokServiceInstance = null;
export function getGrokService() {
    if (!grokServiceInstance) {
        grokServiceInstance = new GrokService();
    }
    return grokServiceInstance;
}
//# sourceMappingURL=grok.js.map
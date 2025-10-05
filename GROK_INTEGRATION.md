# Grok AI Integration - Usage Examples

This document provides examples of how to use the Grok AI integration in PicZFlip.

## Setup

1. Add your Grok API key to the environment:
```bash
export GROK_API_KEY=your_api_key_here
```

2. Or add it to your `.env` file:
```
GROK_API_KEY=your_grok_api_key_here
```

## Basic Usage in TypeScript

### Importing the Service

```typescript
import { getGrokService } from './lib/grok.js';
import { getVisionService } from './lib/vision.js';

const grokService = getGrokService();
```

### Analyzing a Product Image

```typescript
// First, use Vision API to get initial analysis
const visionService = getVisionService();
const visionResult = await visionService.analyzeImage(imageBuffer);

// Then use Grok for enhanced analysis
if (grokService.isAvailable()) {
  const grokAnalysis = await grokService.analyzeProduct(
    imageBuffer,
    visionResult,
    {
      knownBrand: 'Nike',
      knownCategory: 'Shoes',
      additionalInfo: 'Vintage sneakers from the 1990s'
    }
  );
  
  console.log('Product:', grokAnalysis.productIdentification.productName);
  console.log('Estimated Value:', grokAnalysis.pricingInsights.estimatedValueRange);
}
```

### Generating Marketplace Listings

```typescript
// Generate platform-specific listing content
const listing = await grokService.generateListingContent(
  analysis,
  'ebay',
  {
    condition: 'used',
    priceRange: { min: 50, max: 100 },
    shippingMethod: 'USPS Priority Mail',
    returnPolicy: '30 days'
  }
);

console.log('Title:', listing.title);
console.log('Description:', listing.description);
console.log('Keywords:', listing.keywords);
console.log('Suggested Price:', listing.suggestedPrice);
```

## Switching Between AI Providers

You can choose between Gemini and Grok based on your needs:

```typescript
import { getGeminiService } from './lib/gemini.js';
import { getGrokService } from './lib/grok.js';

// Choose AI provider
const aiProvider = process.env.AI_PROVIDER || 'gemini';
const aiService = aiProvider === 'grok' ? getGrokService() : getGeminiService();

// Check if the service is available
if (aiService.isAvailable()) {
  const analysis = await aiService.analyzeProduct(imageBuffer, visionResult);
  // Use the analysis...
} else {
  console.warn(`${aiProvider} service is not available. Check your API key.`);
}
```

## Error Handling

The Grok service includes automatic fallback to Vision API results:

```typescript
try {
  const analysis = await grokService.analyzeProduct(imageBuffer, visionResult);
  // Analysis will either be from Grok or fallback to Vision data
  console.log('Confidence:', analysis.metadata.confidenceScore);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

## Testing with Jupyter Notebook

For experimentation and testing:

1. Navigate to the notebooks directory:
```bash
cd notebooks
```

2. Install dependencies:
```bash
pip install -r ../requirements.txt
pip install git+https://github.com/shawstintshop/grok-xai.git
```

3. Start Jupyter:
```bash
jupyter notebook grok_integration.ipynb
```

4. Follow the examples in the notebook to:
   - Test image analysis
   - Compare Grok vs Gemini results
   - Format data for PicZFlip

## API Response Format

Both Gemini and Grok services return the same response format for compatibility:

```typescript
{
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
```

## Notes

- Grok integration is experimental and requires valid API credentials
- The service automatically retries failed requests up to 3 times
- If Grok is unavailable, the service falls back to Vision API data
- All prices are in USD by default
- Processing time varies based on image complexity and API response time

## Support

For issues or questions:
- Check the main README at `/README.md`
- Review the Jupyter notebook examples at `/notebooks/grok_integration.ipynb`
- See the TypeScript implementation at `/functions/src/lib/grok.ts`

// Copywriter Agent - AI-powered marketplace listing copy generation using Gemini
import { getGeminiService, GeminiAnalysisResult } from '../../lib/gemini.js';
import { log, err } from '../../lib/logger.js';

export interface ListingCopy {
  title: string;
  description: string;
  tags: string[];
  features: string[];
  platforms: PlatformListing[];
}

export interface PlatformListing {
  name: string;
  title: string;
  description: string;
  suggestedPrice: number;
  keywords: string[];
  categoryId: string;
}

const PLATFORM_CONFIGS: Record<string, { maxTitleLength: number; tone: string; features: string }> = {
  ebay: { maxTitleLength: 80, tone: 'professional and detailed', features: 'condition details, shipping info, return policy mention' },
  amazon: { maxTitleLength: 200, tone: 'brand-focused and feature-rich', features: 'bullet points for features, competitive keywords, brand/model emphasis' },
  facebook: { maxTitleLength: 100, tone: 'casual and friendly', features: 'local pickup options, honest condition, quick response promise' },
  mercari: { maxTitleLength: 100, tone: 'clear and fair', features: 'clear photos mention, fair pricing, shipping options' },
  poshmark: { maxTitleLength: 80, tone: 'trendy and appealing', features: 'style details, brand authenticity, measurements' },
};

export const copywriterAgent = {
  async generateListingCopy(itemData: any, pricingData?: any): Promise<ListingCopy> {
    const startTime = Date.now();

    log('Copywriter Agent: Generating listing copy', {
      product: itemData?.details?.productName,
      hasPricing: !!pricingData,
    });

    const geminiData = itemData?.geminiData as GeminiAnalysisResult | undefined;
    const details = itemData?.details || {};
    const pricing = pricingData || {};

    // Generate platform-specific listings
    const platforms: PlatformListing[] = [];
    const platformNames = ['ebay', 'amazon', 'facebook', 'mercari'];

    // Try Gemini AI for each platform
    for (const platform of platformNames) {
      try {
        const listing = await generatePlatformListing(platform, details, pricing, geminiData);
        platforms.push(listing);
      } catch (e: any) {
        err('Copywriter Agent: Gemini listing failed, using fallback', { platform, error: e.message });
        platforms.push(buildFallbackListing(platform, details, pricing));
      }
    }

    // Generate universal tags and features
    const tags = generateTags(details, geminiData);
    const features = generateFeatures(details, geminiData);
    const title = platforms[0]?.title || details.productName || 'Item for Sale';
    const description = platforms[0]?.description || details.description || '';

    log('Copywriter Agent: Complete', {
      platformCount: platforms.length,
      tagCount: tags.length,
      duration: Date.now() - startTime,
    });

    return { title, description, tags, features, platforms };
  },

  async generateDescription(itemData: any): Promise<string> {
    const copy = await this.generateListingCopy(itemData);
    return copy.description;
  },
};

async function generatePlatformListing(
  platform: string,
  details: any,
  pricing: any,
  geminiData?: GeminiAnalysisResult | null
): Promise<PlatformListing> {
  // If we have Gemini data with analysis, use the Gemini service
  if (geminiData) {
    try {
      const geminiService = getGeminiService();
      const listing = await geminiService.generateListingContent(
        geminiData,
        platform as 'ebay' | 'amazon' | 'facebook' | 'mercari',
        {
          condition: details.condition,
          ...(pricing.priceRange ? { priceRange: { min: pricing.priceRange.min, max: pricing.priceRange.max } } : {}),
        }
      );
      return {
        name: platform,
        title: listing.title,
        description: listing.description,
        suggestedPrice: listing.suggestedPrice || pricing.suggestedPrice?.mid || 0,
        keywords: listing.keywords,
        categoryId: listing.categoryId,
      };
    } catch {
      // Fall through to Gemini direct generation
    }
  }

  // Direct Gemini generation
  try {
    const geminiService = getGeminiService();
    const model = (geminiService as any).model;
    if (!model) throw new Error('No model');

    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS['ebay'];
    const suggestedPrice = pricing.platformPricing?.[platform]?.suggested || pricing.suggestedPrice?.mid || pricing.averagePrice || 0;

    const prompt = `Create a ${platform} marketplace listing for this product. Be ${config.tone}. Include ${config.features}.

Product: ${details.productName || 'Unknown'}
Brand: ${details.brand || 'Unknown'}
Model: ${details.model || ''}
Condition: ${details.condition || 'used'}
Features: ${(details.keyFeatures || []).join(', ')}
Suggested Price: $${suggestedPrice}

Respond in JSON:
{
  "title": "Optimized title (max ${config.maxTitleLength} chars)",
  "description": "Compelling product description",
  "keywords": ["search", "keywords"],
  "categoryId": "platform category"
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: platform,
      title: (parsed.title || details.productName || 'Item').substring(0, config.maxTitleLength),
      description: parsed.description || details.description || '',
      suggestedPrice,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      categoryId: parsed.categoryId || 'other',
    };
  } catch {
    return buildFallbackListing(platform, details, pricing);
  }
}

function buildFallbackListing(platform: string, details: any, pricing: any): PlatformListing {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS['ebay'];
  const brand = details.brand && details.brand !== 'Unknown' ? details.brand : '';
  const model = details.model || '';
  const name = details.productName || 'Item';
  const condition = details.condition || 'Used';
  const suggestedPrice = pricing.platformPricing?.[platform]?.suggested || pricing.suggestedPrice?.mid || pricing.averagePrice || 0;

  const title = `${brand} ${model} ${name} - ${condition}`.trim().substring(0, config.maxTitleLength);
  const features = (details.keyFeatures || []).map((f: string) => `- ${f}`).join('\n');
  const description = `${name}${brand ? ` by ${brand}` : ''}${model ? ` (${model})` : ''}\n\nCondition: ${condition}\n\n${details.description || ''}\n\nKey Features:\n${features || '- Quality item in good condition'}`;

  return {
    name: platform,
    title,
    description,
    suggestedPrice,
    keywords: [brand, model, name, condition, details.category || ''].filter(Boolean).map(k => k.toLowerCase()),
    categoryId: 'other',
  };
}

function generateTags(details: any, geminiData?: GeminiAnalysisResult | null): string[] {
  const tags = new Set<string>();

  if (details.brand && details.brand !== 'Unknown') tags.add(details.brand.toLowerCase());
  if (details.model) tags.add(details.model.toLowerCase());
  if (details.category) tags.add(details.category.toLowerCase());
  if (details.condition) tags.add(details.condition.toLowerCase());

  if (geminiData?.listingOptimization?.recommendedKeywords) {
    for (const kw of geminiData.listingOptimization.recommendedKeywords) tags.add(kw.toLowerCase());
  }

  if (details.keyFeatures) {
    for (const f of details.keyFeatures) {
      for (const word of f.toLowerCase().split(/\s+/)) {
        if (word.length > 3) tags.add(word);
      }
    }
  }

  return [...tags].slice(0, 20);
}

function generateFeatures(details: any, geminiData?: GeminiAnalysisResult | null): string[] {
  const features: string[] = [];

  if (geminiData?.marketingInfo?.keyFeatures) {
    features.push(...geminiData.marketingInfo.keyFeatures);
  } else if (details.keyFeatures) {
    features.push(...details.keyFeatures);
  }

  if (details.brand && details.brand !== 'Unknown' && !features.some(f => f.toLowerCase().includes(details.brand.toLowerCase()))) {
    features.unshift(`Brand: ${details.brand}`);
  }
  if (details.condition && !features.some(f => f.toLowerCase().includes('condition'))) {
    features.push(`Condition: ${details.condition}`);
  }

  return features.slice(0, 10);
}

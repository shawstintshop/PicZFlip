// Validation Agent - AI-powered quality assurance for analysis results
import { log, warn } from '../../lib/logger.js';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  analysis: any;
  improvements: string[];
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export const validationAgent = {
  async validateAnalysis(analysis: any): Promise<ValidationResult> {
    const startTime = Date.now();

    log('Validation Agent: Starting validation');

    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const improvements: string[] = [];
    let score = 100;

    // Validate item identification
    score -= validateIdentification(analysis.item, errors, warnings, improvements);

    // Validate search results
    score -= validateSearchResults(analysis, errors, warnings, improvements);

    // Validate pricing data
    score -= validatePricing(analysis.pricing, errors, warnings, improvements);

    // Validate copy/listings
    score -= validateCopy(analysis.copy, errors, warnings, improvements);

    // Validate overall completeness
    score -= validateCompleteness(analysis, errors, warnings, improvements);

    score = Math.max(0, Math.min(100, score));
    const isValid = errors.length === 0 && score >= 30;

    if (warnings.length > 0) {
      warn('Validation Agent: Warnings found', { count: warnings.length });
    }

    log('Validation Agent: Complete', {
      isValid, score, errors: errors.length, warnings: warnings.length,
      duration: Date.now() - startTime,
    });

    return { isValid, score, errors, warnings, analysis, improvements };
  },

  async validateResults(results: any[]): Promise<any[]> {
    return results.filter(result => result && (result.title || result.productName));
  },
};

function validateIdentification(item: any, errors: ValidationIssue[], warnings: ValidationIssue[], improvements: string[]): number {
  let penalty = 0;
  if (!item) {
    errors.push({ field: 'item', message: 'No item identification data', severity: 'error' });
    return 30;
  }

  const details = item.details || item;

  if (!details.productName || details.productName === 'Unknown Item' || details.productName === 'Unknown Product') {
    warnings.push({ field: 'item.productName', message: 'Product could not be identified', severity: 'warning' });
    improvements.push('Upload a clearer photo with visible brand/model labels');
    penalty += 10;
  }

  if (!details.brand || details.brand === 'Unknown') {
    warnings.push({ field: 'item.brand', message: 'Brand not detected', severity: 'warning' });
    penalty += 5;
  }

  if (item.confidence !== undefined && item.confidence < 0.3) {
    warnings.push({ field: 'item.confidence', message: `Low identification confidence: ${Math.round(item.confidence * 100)}%`, severity: 'warning' });
    improvements.push('Take photo in better lighting with product label visible');
    penalty += 10;
  }

  if (!details.condition || details.condition === 'unknown') {
    warnings.push({ field: 'item.condition', message: 'Condition not determined', severity: 'warning' });
    penalty += 3;
  }

  return penalty;
}

function validateSearchResults(analysis: any, errors: ValidationIssue[], warnings: ValidationIssue[], improvements: string[]): number {
  let penalty = 0;
  const searchResults = analysis.searchResults || analysis.aggregatedData;

  if (!searchResults) {
    warnings.push({ field: 'searchResults', message: 'No search results available', severity: 'warning' });
    return 15;
  }

  const results = searchResults.results || searchResults;
  if (Array.isArray(results)) {
    const successCount = results.filter((r: any) => r.success !== false).length;
    const totalItems = results.reduce((s: number, r: any) => s + (r.items?.length || 0), 0);

    if (successCount === 0) {
      errors.push({ field: 'searchResults', message: 'All marketplace searches failed', severity: 'error' });
      penalty += 20;
    } else if (successCount < 3) {
      warnings.push({ field: 'searchResults', message: `Only ${successCount} sources returned results`, severity: 'warning' });
      penalty += 5;
    }

    if (totalItems === 0) {
      warnings.push({ field: 'searchResults.items', message: 'No matching items found in any marketplace', severity: 'warning' });
      improvements.push('Try a more generic search or different product angle');
      penalty += 10;
    } else if (totalItems < 5) {
      warnings.push({ field: 'searchResults.items', message: `Only ${totalItems} items found - pricing may be unreliable`, severity: 'warning' });
      penalty += 5;
    }
  }

  return penalty;
}

function validatePricing(pricing: any, _errors: ValidationIssue[], warnings: ValidationIssue[], improvements: string[]): number {
  let penalty = 0;

  if (!pricing) {
    warnings.push({ field: 'pricing', message: 'No pricing analysis available', severity: 'warning' });
    return 10;
  }

  if (pricing.sampleSize !== undefined && pricing.sampleSize < 3) {
    warnings.push({ field: 'pricing.sampleSize', message: `Small sample size: ${pricing.sampleSize} items`, severity: 'warning' });
    improvements.push('Price recommendation based on limited data - manual research recommended');
    penalty += 5;
  }

  if (pricing.confidence !== undefined && pricing.confidence < 40) {
    warnings.push({ field: 'pricing.confidence', message: `Low pricing confidence: ${pricing.confidence}%`, severity: 'warning' });
    penalty += 5;
  }

  if (pricing.priceRange) {
    const range = pricing.priceRange.max - pricing.priceRange.min;
    const avg = pricing.averagePrice || pricing.medianPrice || 0;
    if (avg > 0 && range / avg > 2) {
      warnings.push({ field: 'pricing.range', message: 'Very wide price range - prices vary significantly', severity: 'warning' });
      improvements.push('Condition and authenticity heavily affect pricing for this item');
      penalty += 3;
    }
  }

  if (pricing.marketTrend === 'volatile') {
    warnings.push({ field: 'pricing.trend', message: 'Market pricing is volatile', severity: 'warning' });
    penalty += 2;
  }

  return penalty;
}

function validateCopy(copy: any, _errors: ValidationIssue[], warnings: ValidationIssue[], improvements: string[]): number {
  let penalty = 0;

  if (!copy) {
    warnings.push({ field: 'copy', message: 'No listing copy generated', severity: 'warning' });
    return 5;
  }

  if (!copy.title || copy.title === 'Generated Product Title') {
    warnings.push({ field: 'copy.title', message: 'Generic title generated', severity: 'warning' });
    penalty += 3;
  }

  if (!copy.platforms || copy.platforms.length === 0) {
    warnings.push({ field: 'copy.platforms', message: 'No platform-specific listings generated', severity: 'warning' });
    penalty += 5;
  }

  if (copy.tags && copy.tags.length < 3) {
    improvements.push('Add more tags to improve search visibility');
    penalty += 2;
  }

  return penalty;
}

function validateCompleteness(analysis: any, _errors: ValidationIssue[], warnings: ValidationIssue[], _improvements: string[]): number {
  let penalty = 0;

  const stages = analysis.stages || {};
  const expectedStages = ['identification', 'routing', 'searching', 'aggregating', 'pricing', 'copywriting'];
  const completedStages = expectedStages.filter(s => stages[s]?.completed);

  if (completedStages.length < expectedStages.length) {
    const missing = expectedStages.filter(s => !stages[s]?.completed);
    warnings.push({ field: 'stages', message: `Incomplete stages: ${missing.join(', ')}`, severity: 'warning' });
    penalty += missing.length * 2;
  }

  if (analysis.totalDuration && analysis.totalDuration > 120000) {
    warnings.push({ field: 'performance', message: `Analysis took ${Math.round(analysis.totalDuration / 1000)}s`, severity: 'info' });
  }

  return penalty;
}

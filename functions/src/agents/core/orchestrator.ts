import { identifierAgent } from './identifierAgent.js';
import { categoryRouter } from './categoryRouter.js';
import { searchManager } from './searchManager.js';
import { resultsAggregator } from './resultsAggregator.js';
import { pricingAgent } from '../analysis/pricingAgent.js';
import { copywriterAgent } from '../content/copywriterAgent.js';
import { validationAgent } from '../quality/validationAgent.js';
import { db, now } from '../../lib/firestore.js';
import { log, err } from '../../lib/logger.js';
import { ErrorHandler } from '../../lib/errorHandler.js';

export class MainOrchestrator {
  constructor() {
    // Constructor can be empty since we use static methods
  }

  async processPhotoAnalysis(imageBuffer: Buffer, uid: string, analysisId: string) {
    const startTime = Date.now();
    let analysis: any = null;

    try {
      log(`Starting photo analysis for user ${uid}, analysis ${analysisId}`);

      // Stage 1: Item Identification
      analysis = await this.runStage('identification', async () => {
        const itemData = await identifierAgent.identifyFromPhoto(imageBuffer);
        return {
          id: analysisId,
          uid,
          status: 'identifying',
          item: itemData,
          createdAt: now(),
          stages: { identification: { completed: true, duration: Date.now() - startTime } }
        };
      });

      // Save progress
      await db.collection('analyses').doc(analysisId).set(analysis);

      // Stage 2: Category Routing
      analysis = await this.runStage('routing', async () => {
        const routingData = await categoryRouter.determineSearchStrategy(analysis.item);
        return {
          ...analysis,
          status: 'routing',
          routing: routingData,
          stages: {
            ...analysis.stages,
            routing: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      await db.collection('analyses').doc(analysisId).update(analysis);

      // Stage 3: Comprehensive Search
      analysis = await this.runStage('searching', async () => {
        const searchResults = await searchManager.executeSearchPlan(
          analysis.routing.searchPlan,
          analysis.item
        );
        return {
          ...analysis,
          status: 'searching',
          searchResults,
          stages: {
            ...analysis.stages,
            searching: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      await db.collection('analyses').doc(analysisId).update(analysis);

      // Stage 4: Results Aggregation
      analysis = await this.runStage('aggregating', async () => {
        const aggregatedData = await resultsAggregator.processSearchResults(
          analysis.searchResults,
          analysis.item
        );
        return {
          ...analysis,
          status: 'aggregating',
          aggregatedData,
          stages: {
            ...analysis.stages,
            aggregating: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      await db.collection('analyses').doc(analysisId).update(analysis);

      // Stage 5: Price Analysis
      analysis = await this.runStage('pricing', async () => {
        const pricingData = await pricingAgent.analyzePricing(analysis.aggregatedData);
        return {
          ...analysis,
          status: 'pricing',
          pricing: pricingData,
          stages: {
            ...analysis.stages,
            pricing: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      await db.collection('analyses').doc(analysisId).update(analysis);

      // Stage 6: Copy Generation
      analysis = await this.runStage('copywriting', async () => {
        const copyData = await copywriterAgent.generateListingCopy(
          analysis.item,
          analysis.pricing
        );
        return {
          ...analysis,
          status: 'copywriting',
          copy: copyData,
          stages: {
            ...analysis.stages,
            copywriting: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      await db.collection('analyses').doc(analysisId).update(analysis);

      // Stage 7: Final Validation
      analysis = await this.runStage('validation', async () => {
        const validationResults = await validationAgent.validateAnalysis(analysis);
        return {
          ...analysis,
          status: validationResults.isValid ? 'completed' : 'validation_failed',
          validation: validationResults,
          totalDuration: Date.now() - startTime,
          stages: {
            ...analysis.stages,
            validation: { completed: true, duration: Date.now() - startTime }
          }
        };
      });

      // Final save
      await db.collection('analyses').doc(analysisId).set(analysis);

      log(`Analysis completed successfully in ${Date.now() - startTime}ms`);
      return analysis;

    } catch (error: any) {
      err('Analysis failed:', error);
      
      // Save error state
      const errorAnalysis = {
        ...analysis,
        status: 'error',
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: Date.now()
        },
        totalDuration: Date.now() - startTime
      };

      await db.collection('analyses').doc(analysisId).set(errorAnalysis);
      throw error;
    }
  }

  private async runStage<T>(stageName: string, stageFunction: () => Promise<T>): Promise<T> {
    try {
      log(`Starting stage: ${stageName}`);
      const result = await stageFunction();
      log(`Stage ${stageName} completed successfully`);
      return result;
    } catch (error: any) {
      err(`Stage ${stageName} failed:`, error);
      await ErrorHandler.handleStageError(stageName, error);
      throw error;
    }
  }
}

export const mainOrchestrator = new MainOrchestrator();

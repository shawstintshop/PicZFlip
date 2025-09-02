import * as admin from 'firebase-admin';
import { ENV } from '../env.js';
import { logger } from './logger.js';
import { getVisionService } from './vision.js';
import { getGeminiService } from './gemini.js';

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
  environment: {
    nodeVersion: string;
    nodeEnv: string;
    region: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

export class HealthMonitor {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Perform comprehensive health checks
   */
  async checkHealth(): Promise<HealthStatus> {
    logger.debug('Starting health check');
    const startTime = Date.now();

    const checks: HealthCheck[] = await Promise.all([
      this.checkFirestore(),
      this.checkFirebaseAuth(),
      this.checkFirebaseStorage(),
      this.checkGoogleVisionAPI(),
      this.checkGeminiAPI(),
      this.checkEnvironmentVariables(),
      this.checkMemoryUsage()
    ]);

    const overallStatus = this.determineOverallStatus(checks);
    const totalTime = Date.now() - startTime;

    const healthStatus: HealthStatus = {
      overall: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Date.now() - this.startTime,
      checks,
      environment: {
        nodeVersion: process.version,
        nodeEnv: ENV.NODE_ENV,
        region: ENV.REGION,
        memoryUsage: process.memoryUsage()
      }
    };

    logger.info('Health check completed', {
      status: overallStatus,
      duration: totalTime,
      checksCount: checks.length
    });

    return healthStatus;
  }

  /**
   * Quick health check for load balancers
   */
  async quickCheck(): Promise<{ status: 'ok' | 'error'; uptime: number }> {
    try {
      // Just check if we can connect to Firestore
      const db = admin.firestore();
      await db.collection('_health').limit(1).get();
      
      return {
        status: 'ok',
        uptime: Date.now() - this.startTime
      };
    } catch (error) {
      logger.error('Quick health check failed', { error });
      return {
        status: 'error',
        uptime: Date.now() - this.startTime
      };
    }
  }

  private async checkFirestore(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const db = admin.firestore();
      
      // Test read operation
      const testDoc = await db.collection('_health').doc('test').get();
      
      // Test write operation
      await db.collection('_health').doc('test').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true
      });

      return {
        service: 'firestore',
        status: 'healthy',
        responseTime: Date.now() - start,
        details: {
          canRead: true,
          canWrite: true,
          testDocExists: testDoc.exists
        }
      };
    } catch (error: any) {
      return {
        service: 'firestore',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error.message,
        details: { errorCode: error.code }
      };
    }
  }

  private async checkFirebaseAuth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Test auth service by listing users (limited)
      const listUsersResult = await admin.auth().listUsers(1);
      
      return {
        service: 'firebase-auth',
        status: 'healthy',
        responseTime: Date.now() - start,
        details: {
          canListUsers: true,
          totalUsers: listUsersResult.users.length
        }
      };
    } catch (error: any) {
      return {
        service: 'firebase-auth',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error.message,
        details: { errorCode: error.code }
      };
    }
  }

  private async checkFirebaseStorage(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const bucket = admin.storage().bucket();
      
      // Test bucket access
      const [exists] = await bucket.exists();
      
      return {
        service: 'firebase-storage',
        status: exists ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        details: {
          bucketExists: exists,
          bucketName: bucket.name
        }
      };
    } catch (error: any) {
      return {
        service: 'firebase-storage',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error.message
      };
    }
  }

  private async checkGoogleVisionAPI(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      if (!ENV.GOOGLE_VISION_API_KEY && !ENV.GOOGLE_APPLICATION_CREDENTIALS) {
        return {
          service: 'google-vision',
          status: 'degraded',
          responseTime: Date.now() - start,
          error: 'No API credentials configured'
        };
      }

      const visionService = getVisionService();
      
      // Create a minimal test image (1x1 white pixel)
      const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      
      // Test with a simple label detection
      const result = await visionService.analyzeImage(testImageBuffer);
      
      return {
        service: 'google-vision',
        status: 'healthy',
        responseTime: Date.now() - start,
        details: {
          canAnalyze: true,
          labelsFound: result.labels.length
        }
      };
    } catch (error: any) {
      // If it's just quota or auth error, mark as degraded instead of unhealthy
      const isDegraded = error.message.includes('quota') || error.message.includes('QUOTA') ||
                         error.message.includes('403') || error.message.includes('401');
      
      return {
        service: 'google-vision',
        status: isDegraded ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - start,
        error: error.message
      };
    }
  }

  private async checkGeminiAPI(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      if (!ENV.GEMINI_API_KEY) {
        return {
          service: 'gemini-ai',
          status: 'degraded',
          responseTime: Date.now() - start,
          error: 'No API key configured'
        };
      }

      const geminiService = getGeminiService();
      
      // Test with minimal Vision result and small image
      const testVisionResult = {
        labels: [{ description: 'test', score: 0.9, confidence: 90 }],
        objects: [],
        text: { fullText: '', blocks: [] },
        properties: { dominantColors: [] },
        brands: [],
        metadata: { width: 1, height: 1, format: 'png', analysisTime: 0 }
      };

      const testImageBuffer = Buffer.from('test');
      
      // This might fail due to invalid image, but we're testing API connectivity
      try {
        await geminiService.analyzeProduct(testImageBuffer, testVisionResult);
        
        return {
          service: 'gemini-ai',
          status: 'healthy',
          responseTime: Date.now() - start,
          details: { canAnalyze: true }
        };
      } catch (geminiError: any) {
        // If it's an image format error, the API is working
        if (geminiError.message.includes('image') || geminiError.message.includes('format')) {
          return {
            service: 'gemini-ai',
            status: 'healthy',
            responseTime: Date.now() - start,
            details: { canConnect: true, testLimited: true }
          };
        }
        throw geminiError;
      }
    } catch (error: any) {
      const isDegraded = error.message.includes('quota') || error.message.includes('QUOTA') ||
                         error.message.includes('403') || error.message.includes('401');
      
      return {
        service: 'gemini-ai',
        status: isDegraded ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - start,
        error: error.message
      };
    }
  }

  private async checkEnvironmentVariables(): Promise<HealthCheck> {
    const start = Date.now();
    
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'GOOGLE_VISION_API_KEY',
      'GEMINI_API_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !ENV[varName as keyof typeof ENV]);
    const optionalVars = [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];

    const missingOptionalVars = optionalVars.filter(varName => !ENV[varName as keyof typeof ENV]);

    const status = missingVars.length === 0 ? 'healthy' : 'unhealthy';

    return {
      service: 'environment',
      status,
      responseTime: Date.now() - start,
      details: {
        requiredVars: requiredVars.length,
        missingRequired: missingVars,
        missingOptional: missingOptionalVars,
        nodeEnv: ENV.NODE_ENV,
        region: ENV.REGION
      }
    };
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    
    // Convert to MB
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const rssUsageMB = memUsage.rss / 1024 / 1024;
    
    // Thresholds (these can be adjusted based on your instance size)
    const heapUsagePercentage = (heapUsedMB / heapTotalMB) * 100;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (heapUsagePercentage > 90 || rssUsageMB > 1024) {
      status = 'unhealthy';
    } else if (heapUsagePercentage > 75 || rssUsageMB > 512) {
      status = 'degraded';
    }

    return {
      service: 'memory',
      status,
      responseTime: Date.now() - start,
      details: {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        heapUsagePercentage: Math.round(heapUsagePercentage),
        rssUsageMB: Math.round(rssUsageMB),
        externalMB: Math.round(memUsage.external / 1024 / 1024)
      }
    };
  }

  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    }
    
    if (degradedCount > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Monitor specific metrics over time
   */
  async collectMetrics(): Promise<{
    timestamp: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
    activeHandles: number;
    activeRequests: number;
  }> {
    return {
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      activeHandles: (process as any)._getActiveHandles().length,
      activeRequests: (process as any)._getActiveRequests().length
    };
  }
}

// Singleton instance
let healthMonitorInstance: HealthMonitor | null = null;

export function getHealthMonitor(): HealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new HealthMonitor();
  }
  return healthMonitorInstance;
}

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
export declare class HealthMonitor {
    private startTime;
    constructor();
    /**
     * Perform comprehensive health checks
     */
    checkHealth(): Promise<HealthStatus>;
    /**
     * Quick health check for load balancers
     */
    quickCheck(): Promise<{
        status: 'ok' | 'error';
        uptime: number;
    }>;
    private checkFirestore;
    private checkFirebaseAuth;
    private checkFirebaseStorage;
    private checkGoogleVisionAPI;
    private checkGeminiAPI;
    private checkEnvironmentVariables;
    private checkMemoryUsage;
    private determineOverallStatus;
    /**
     * Monitor specific metrics over time
     */
    collectMetrics(): Promise<{
        timestamp: string;
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
        activeHandles: number;
        activeRequests: number;
    }>;
}
export declare function getHealthMonitor(): HealthMonitor;
//# sourceMappingURL=health.d.ts.map
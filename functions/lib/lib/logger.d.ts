export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
declare class Logger {
    private logLevel;
    constructor();
    private getLogLevelFromEnv;
    private shouldLog;
    private formatMessage;
    private log;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    fatal(message: string, data?: any): void;
    logFunctionCall(functionName: string, params?: any): void;
    logFunctionReturn(functionName: string, result?: any): void;
    logPerformance(functionName: string, durationMs: number): void;
    logUserAction(userId: string, action: string, details?: any): void;
    logSearchQuery(query: string, sourceCount: number): void;
    logSearchResult(sourceId: string, itemCount: number, durationMs: number): void;
    logError(error: Error, context?: string): void;
    logAnalytics(event: string, properties: Record<string, any>): void;
    logApiCall(service: string, endpoint: string, durationMs: number, success: boolean): void;
    logRateLimit(userId: string, action: string, limit: number, current: number): void;
}
export declare const logger: Logger;
export declare const log: (message: string, data?: any) => void;
export declare const debug: (message: string, data?: any) => void;
export declare const warn: (message: string, data?: any) => void;
export declare const err: (message: string, data?: any) => void;
export declare const fatal: (message: string, data?: any) => void;
export declare function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export {};
//# sourceMappingURL=logger.d.ts.map
import { ENV } from '../env.js';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = ENV.LOG_LEVEL.toLowerCase();
    switch (level) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'fatal': return LogLevel.FATAL;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelName, message, data);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.FATAL:
        console.error(`🚨 FATAL: ${formattedMessage}`);
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  fatal(message: string, data?: any): void {
    this.log(LogLevel.FATAL, 'FATAL', message, data);
  }

  // Convenience methods for common logging patterns
  logFunctionCall(functionName: string, params?: any): void {
    this.debug(`Function called: ${functionName}`, params);
  }

  logFunctionReturn(functionName: string, result?: any): void {
    this.debug(`Function returned: ${functionName}`, result);
  }

  logPerformance(functionName: string, durationMs: number): void {
    this.info(`Performance: ${functionName} took ${durationMs}ms`);
  }

  logUserAction(userId: string, action: string, details?: any): void {
    this.info(`User action: ${userId} - ${action}`, details);
  }

  logSearchQuery(query: string, sourceCount: number): void {
    this.info(`Search query: "${query}" across ${sourceCount} sources`);
  }

  logSearchResult(sourceId: string, itemCount: number, durationMs: number): void {
    this.debug(`Search result: ${sourceId} found ${itemCount} items in ${durationMs}ms`);
  }

  logError(error: Error, context?: string): void {
    this.error(`Error in ${context || 'unknown context'}: ${error.message}`, {
      stack: error.stack,
      name: error.name,
      context
    });
  }

  // Structured logging for analytics
  logAnalytics(event: string, properties: Record<string, any>): void {
    this.info(`Analytics: ${event}`, properties);
  }

  // Logging for external API calls
  logApiCall(service: string, endpoint: string, durationMs: number, success: boolean): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    this.info(`API call: ${service} ${endpoint} - ${status} (${durationMs}ms)`);
  }

  // Logging for rate limiting
  logRateLimit(userId: string, action: string, limit: number, current: number): void {
    this.warn(`Rate limit: ${userId} - ${action} (${current}/${limit})`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common logging functions
export const log = (message: string, data?: any) => logger.info(message, data);
export const debug = (message: string, data?: any) => logger.debug(message, data);
export const warn = (message: string, data?: any) => logger.warn(message, data);
export const err = (message: string, data?: any) => logger.error(message, data);
export const fatal = (message: string, data?: any) => logger.fatal(message, data);

// Performance logging decorator
export function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration);
      throw error;
    }
  };

  return descriptor;
}

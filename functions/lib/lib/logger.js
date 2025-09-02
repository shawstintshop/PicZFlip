import { ENV } from '../env.js';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (LogLevel = {}));
class Logger {
    logLevel;
    constructor() {
        this.logLevel = this.getLogLevelFromEnv();
    }
    getLogLevelFromEnv() {
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
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (data) {
            return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
        }
        return `${prefix} ${message}`;
    }
    log(level, levelName, message, data) {
        if (!this.shouldLog(level))
            return;
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
    debug(message, data) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, 'INFO', message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, 'WARN', message, data);
    }
    error(message, data) {
        this.log(LogLevel.ERROR, 'ERROR', message, data);
    }
    fatal(message, data) {
        this.log(LogLevel.FATAL, 'FATAL', message, data);
    }
    // Convenience methods for common logging patterns
    logFunctionCall(functionName, params) {
        this.debug(`Function called: ${functionName}`, params);
    }
    logFunctionReturn(functionName, result) {
        this.debug(`Function returned: ${functionName}`, result);
    }
    logPerformance(functionName, durationMs) {
        this.info(`Performance: ${functionName} took ${durationMs}ms`);
    }
    logUserAction(userId, action, details) {
        this.info(`User action: ${userId} - ${action}`, details);
    }
    logSearchQuery(query, sourceCount) {
        this.info(`Search query: "${query}" across ${sourceCount} sources`);
    }
    logSearchResult(sourceId, itemCount, durationMs) {
        this.debug(`Search result: ${sourceId} found ${itemCount} items in ${durationMs}ms`);
    }
    logError(error, context) {
        this.error(`Error in ${context || 'unknown context'}: ${error.message}`, {
            stack: error.stack,
            name: error.name,
            context
        });
    }
    // Structured logging for analytics
    logAnalytics(event, properties) {
        this.info(`Analytics: ${event}`, properties);
    }
    // Logging for external API calls
    logApiCall(service, endpoint, durationMs, success) {
        const status = success ? 'SUCCESS' : 'FAILED';
        this.info(`API call: ${service} ${endpoint} - ${status} (${durationMs}ms)`);
    }
    // Logging for rate limiting
    logRateLimit(userId, action, limit, current) {
        this.warn(`Rate limit: ${userId} - ${action} (${current}/${limit})`);
    }
}
// Export singleton instance
export const logger = new Logger();
// Convenience exports for common logging functions
export const log = (message, data) => logger.info(message, data);
export const debug = (message, data) => logger.debug(message, data);
export const warn = (message, data) => logger.warn(message, data);
export const err = (message, data) => logger.error(message, data);
export const fatal = (message, data) => logger.fatal(message, data);
// Performance logging decorator
export function logPerformance(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        const startTime = Date.now();
        try {
            const result = await originalMethod.apply(this, args);
            const duration = Date.now() - startTime;
            logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration);
            throw error;
        }
    };
    return descriptor;
}
//# sourceMappingURL=logger.js.map
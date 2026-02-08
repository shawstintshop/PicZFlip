// Error Handler - Structured error handling with logging and Firestore persistence
import { err, warn } from './logger.js';

export interface ErrorReport {
  stageName: string;
  error: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

const recentErrors: ErrorReport[] = [];
const MAX_ERROR_HISTORY = 50;

export class ErrorHandler {
  static handle(error: any, context?: Record<string, any>): void {
    const report = buildReport('unknown', error, context);
    trackError(report);
    err(`Error: ${report.error}`, { severity: report.severity, context });
  }

  static async handleAsync(error: any, context?: Record<string, any>): Promise<void> {
    this.handle(error, context);
    // Attempt to persist to Firestore (best-effort)
    try {
      const { db } = await import('./firestore.js');
      await db.collection('errors').add({
        ...buildReport('async', error, context),
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Firestore persistence is best-effort
    }
  }

  static async handleStageError(stageName: string, error: any, context?: Record<string, any>): Promise<void> {
    const report = buildReport(stageName, error, context);
    trackError(report);
    err(`Stage [${stageName}] failed: ${report.error}`, {
      severity: report.severity,
      recoverable: report.recoverable,
      context,
    });

    // Persist stage errors
    try {
      const { db } = await import('./firestore.js');
      await db.collection('errors').add({ ...report, createdAt: new Date().toISOString() });
    } catch {
      // Best-effort
    }
  }

  static getRecentErrors(): ErrorReport[] {
    return [...recentErrors];
  }

  static getErrorStats(): { total: number; bySeverity: Record<string, number>; byStage: Record<string, number> } {
    const bySeverity: Record<string, number> = {};
    const byStage: Record<string, number> = {};
    for (const e of recentErrors) {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
      byStage[e.stageName] = (byStage[e.stageName] || 0) + 1;
    }
    return { total: recentErrors.length, bySeverity, byStage };
  }
}

function buildReport(stageName: string, error: any, context?: Record<string, any>): ErrorReport {
  const message = error?.message || String(error);
  const severity = classifySeverity(message, stageName);
  const recoverable = isRecoverable(message, stageName);

  return {
    stageName,
    error: message,
    stack: error?.stack,
    timestamp: Date.now(),
    severity,
    recoverable,
    ...(context !== undefined ? { context } : {}),
  };
}

function classifySeverity(message: string, stage: string): ErrorReport['severity'] {
  const msg = message.toLowerCase();
  if (msg.includes('api_key') || msg.includes('authentication') || msg.includes('permission')) return 'critical';
  if (msg.includes('timeout') || msg.includes('rate limit') || msg.includes('quota')) return 'medium';
  if (stage === 'identification' || stage === 'validation') return 'high';
  if (msg.includes('network') || msg.includes('fetch')) return 'medium';
  return 'low';
}

function isRecoverable(message: string, stage: string): boolean {
  const msg = message.toLowerCase();
  if (msg.includes('timeout') || msg.includes('rate limit') || msg.includes('network')) return true;
  if (msg.includes('api_key') || msg.includes('permission') || msg.includes('authentication')) return false;
  if (stage === 'searching' || stage === 'aggregating') return true;
  return false;
}

function trackError(report: ErrorReport): void {
  recentErrors.push(report);
  if (recentErrors.length > MAX_ERROR_HISTORY) recentErrors.shift();
  if (report.severity === 'critical') {
    warn(`CRITICAL ERROR in ${report.stageName}: ${report.error}`);
  }
}

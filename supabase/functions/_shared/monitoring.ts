/**
 * monitoring.ts
 * Supabase Edge Functions — Shared monitoring utilities
 *
 * Features:
 * - Error logging with structured format
 * - Performance metrics (start/end timing)
 * - User action tracking (anonymized)
 */

export interface LogContext {
  function: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Global metrics store (resets on cold start)
const metrics: PerformanceMetric[] = [];

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Anonymize user ID for tracking (last 4 chars only)
 * e.g., "user_abc123def456" -> "****f456"
 */
export function anonymizeUserId(userId: string): string {
  if (!userId || userId.length < 8) return "****";
  return `****${userId.slice(-4)}`;
}

/**
 * Log info message with structured context
 */
export function logInfo(message: string, context?: Partial<LogContext>): void {
  const entry = {
    level: "INFO",
    timestamp: new Date().toISOString(),
    message,
    ...context,
  };
  console.log(`[${entry.timestamp}] INFO: ${message}`, JSON.stringify(context || {}));
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: Partial<LogContext>): void {
  const entry = {
    level: "WARN",
    timestamp: new Date().toISOString(),
    message,
    ...context,
  };
  console.warn(`[${entry.timestamp}] WARN: ${message}`, JSON.stringify(context || {}));
}

/**
 * Log error with stack trace
 */
export function logError(
  message: string,
  error: unknown,
  context?: Partial<LogContext>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  const entry = {
    level: "ERROR",
    timestamp: new Date().toISOString(),
    message,
    error: errorMessage,
    stack: stackTrace,
    ...context,
  };

  console.error(`[${entry.timestamp}] ERROR: ${message}`, JSON.stringify(entry));
}

/**
 * Start a performance timer
 */
export function startTimer(name: string, metadata?: Record<string, unknown>): PerformanceMetric {
  const metric: PerformanceMetric = {
    name,
    startTime: performance.now(),
    metadata,
  };
  metrics.push(metric);
  return metric;
}

/**
 * End a performance timer and return duration
 */
export function endTimer(metric: PerformanceMetric): number {
  metric.endTime = performance.now();
  metric.duration = metric.endTime - metric.startTime;

  console.log(
    `[PERF] ${metric.name}: ${metric.duration.toFixed(2)}ms`,
    JSON.stringify(metric.metadata || {})
  );

  return metric.duration;
}

/**
 * Track a user action (anonymized)
 */
export function trackAction(
  action: string,
  userId: string,
  metadata?: Record<string, unknown>
): void {
  const anonymizedId = anonymizeUserId(userId);

  const entry = {
    level: "ACTION",
    timestamp: new Date().toISOString(),
    action,
    anonymizedUserId: anonymizedId,
    ...metadata,
  };

  console.log(`[ACTION] ${action}`, JSON.stringify(entry));
}

/**
 * Track a payment-related action
 */
export function trackPaymentAction(
  action: string,
  userId: string,
  amount: number,
  currency: string,
  status: string
): void {
  trackAction(`payment:${action}`, userId, {
    amount,
    currency,
    status,
    // Amount is stored in satang (THB) or cents (USD)
    displayAmount: `${currency} ${(amount / 100).toFixed(2)}`,
  });
}

/**
 * Create standard CORS headers for Edge Functions
 */
export function getCorsHeaders(
  allowedOrigins: string[] = ["*"]
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.join(", "),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

/**
 * Create a timing middleware wrapper for functions
 */
export function withMonitoring<T extends (...args: unknown[]) => unknown>(
  functionName: string,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = generateRequestId();
    const startTime = performance.now();

    logInfo(`Function started`, { function: functionName, requestId });

    try {
      const result = await handler(...args);
      const duration = performance.now() - startTime;

      logInfo(`Function completed`, {
        function: functionName,
        requestId,
        durationMs: duration.toFixed(2),
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      logError(`Function failed`, error, {
        function: functionName,
        requestId,
        durationMs: duration.toFixed(2),
      });

      throw error;
    }
  }) as T;
}

/**
 * Get all collected metrics (useful for debugging)
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Clear metrics (useful for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

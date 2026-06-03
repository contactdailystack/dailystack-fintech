// Global error handling middleware for Express
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // If response already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err as any);
  }
  // Capture with Sentry if initialized
  if (Sentry && typeof Sentry.captureException === 'function') {
    try {
      Sentry.captureException(err);
    } catch (e) {
      // ignore Sentry failures
    }
  }
  const status = (err && typeof err === 'object' && 'status' in (err as any) && typeof (err as any).status === 'number')
    ? (err as any).status
    : 500;
  const message = (err && typeof err === 'object' && 'message' in (err as any) && typeof (err as any).message === 'string')
    ? (err as any).message
    : 'Internal Server Error';
  // Hide internal details in production for 500s
  const response = process.env.NODE_ENV === 'production' && status === 500
    ? { error: 'internal' }
    : { error: message };
  if (process.env.NODE_ENV !== 'production') {
    console.error('[errorHandler]', err);
  } else {
    console.error('[errorHandler] status=%d', status);
  }
  res.status(status).json(response);
}

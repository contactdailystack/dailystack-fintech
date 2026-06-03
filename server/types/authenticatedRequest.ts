import { Request } from 'express';

// Express Request with an attached authenticated user id
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { AuthenticatedRequest } from '../types/authenticatedRequest';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Express middleware that validates the session cookie (JWT) and attaches
 * `req.userId` for downstream handlers.
 * Returns 401 if the token is missing or invalid.
 */
export const authGuard = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const token = (req as any).cookies?.['session_token'];
    if (!token) {
      return _res.status(401).json({ error: 'unauthenticated' });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    // Attach user id to request for later use (typed)
    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('[authGuard] token verification failed');
    return _res.status(401).json({ error: 'invalid_token' });
  }
};

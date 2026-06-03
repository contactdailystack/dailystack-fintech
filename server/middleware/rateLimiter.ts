// rateLimiter middleware for OTP and push endpoints
import rateLimit from 'express-rate-limit';

// IP limiter (generic) – can be reused
export const pushLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP per-IP limiter
export const otpIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP per-email limiter – also used for throttling within TTL
export const otpEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    try {
      const email = (req.body && req.body.email) ? String(req.body.email).trim().toLowerCase() : '';
      return email || req.ip;
    } catch (e) {
      return req.ip;
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

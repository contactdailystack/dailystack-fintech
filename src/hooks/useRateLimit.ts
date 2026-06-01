/**
 * Hook: Rate Limiting
 * Tracks failed attempts and enforces lockout period (15 min after 5 attempts)
 */

export interface RateLimitState {
  attempts: number;
  isLocked: boolean;
  secondsUntilReset: number;
}

const STORAGE_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const useRateLimit = () => {
  // Get current rate limit state
  const getState = (): RateLimitState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { attempts: 0, isLocked: false, secondsUntilReset: 0 };
      }

      const { attempts, lockedUntil } = JSON.parse(stored);
      const now = Date.now();
      const isLocked = now < lockedUntil;
      const secondsUntilReset = isLocked ? Math.ceil((lockedUntil - now) / 1000) : 0;

      // Auto-reset if lockout expired
      if (!isLocked) {
        localStorage.removeItem(STORAGE_KEY);
        return { attempts: 0, isLocked: false, secondsUntilReset: 0 };
      }

      return { attempts, isLocked, secondsUntilReset };
    } catch {
      return { attempts: 0, isLocked: false, secondsUntilReset: 0 };
    }
  };

  // Record a failed attempt
  const recordFailure = (): RateLimitState => {
    const state = getState();

    if (state.isLocked) {
      return state;
    }

    const newAttempts = state.attempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;
    const lockedUntil = shouldLock ? Date.now() + LOCKOUT_DURATION_MS : Date.now();

    const newState = {
      attempts: shouldLock ? MAX_ATTEMPTS : newAttempts,
      lockedUntil,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    return {
      attempts: newState.attempts,
      isLocked: shouldLock,
      secondsUntilReset: shouldLock ? Math.ceil(LOCKOUT_DURATION_MS / 1000) : 0,
    };
  };

  // Reset on successful attempt
  const reset = (): void => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { getState, recordFailure, reset };
};

// Simple in-memory OTP cache with expiration handling
export const OTP_TTL_MS = Number(process.env.OTP_TTL_MS) || 5 * 60 * 1000; // 5 min default
export const otpCache = new Map<string, number>();

// Optional cleanup (run periodically)
function cleanup() {
  const now = Date.now();
  for (const [email, ts] of otpCache.entries()) {
    if (now - ts > OTP_TTL_MS) {
      otpCache.delete(email);
    }
  }
}
if (typeof setInterval === 'function') {
  setInterval(cleanup, 60_000);
}

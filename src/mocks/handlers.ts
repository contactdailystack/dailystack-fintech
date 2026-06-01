import { rest } from 'msw';

// Simple in-memory store for OTP codes (dev only)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateCode(length: number) {
  let code = '';
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

export const handlers = [
  rest.post('/api/send-otp', async (req, res, ctx) => {
    const { email, length } = await req.json().catch(() => ({}));
    if (!email) {
      return res(ctx.status(400), ctx.json({ message: 'Missing email' }));
    }
    const len = Number(length) || 6;
    const code = generateCode(len);
    const expiresAt = Date.now() + 120_000; // expires in 2 minutes
    otpStore.set(email, { code, expiresAt });
    // For developer convenience, return the code in the response (only in dev)
    return res(
      ctx.delay(500),
      ctx.status(200),
      ctx.json({ message: 'OTP sent (dev)', code, expiresIn: 120 })
    );
  }),

  rest.post('/api/verify-otp', async (req, res, ctx) => {
    const { email, code } = await req.json().catch(() => ({}));
    if (!email || !code) {
      return res(ctx.status(400), ctx.json({ message: 'Missing email or code' }));
    }
    const entry = otpStore.get(email);
    if (!entry) {
      return res(ctx.status(400), ctx.json({ message: 'No code sent for this email' }));
    }
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return res(ctx.status(410), ctx.json({ message: 'Code expired' }));
    }
    if (entry.code !== String(code)) {
      return res(ctx.status(401), ctx.json({ message: 'Invalid code' }));
    }
    otpStore.delete(email);
    return res(ctx.delay(400), ctx.status(200), ctx.json({ message: 'Verified' }));
  }),
];

// Dev helper: expose OTP store peek for tests
export function peekOtpFor(email: string) {
  return otpStore.get(email)?.code ?? null;
}

import { randomBytes } from 'crypto';

// Generate a strong, human-safe password for tests. Not persisted to disk.
export function generateRandomPassword(length = 16): string {
  // produce base64 and strip non-url safe chars, then truncate
  const buf = randomBytes(Math.ceil((length * 3) / 4));
  return buf.toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length) + '!A1';
}

export function redactEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const prefix = name.length > 4 ? name.slice(0, 4) : name.slice(0, Math.max(1, Math.floor(name.length / 2)));
  return `${prefix}*****@${domain}`;
}

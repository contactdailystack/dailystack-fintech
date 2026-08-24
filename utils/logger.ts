export function info(msg: string, meta?: any) {
  try {
    console.log('[INFO]', msg, meta || '');
  } catch (e) {
    // swallow logging errors in tests
  }
}

export function error(msg: string, meta?: any) {
  try {
    console.error('[ERROR]', msg, meta || '');
  } catch (e) {
    // swallow logging errors in tests
  }
}

export function redact(str?: string): string {
  if (!str) return '';
  // basic email redaction
  const parts = String(str).split('@');
  if (parts.length === 2) {
    const name = parts[0];
    const domain = parts[1];
    const visible = name.slice(0, Math.min(4, Math.max(1, Math.floor(name.length / 2))));
    return `${visible}*****@${domain}`;
  }
  // fallback: hash-like redaction
  return `${String(str).slice(0, 4)}*****`;
}

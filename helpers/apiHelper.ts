/*
 * apiHelper
 * Lightweight admin endpoint caller used by test helpers. This implementation
 * requires `ADMIN_ENDPOINT` (and optionally `ADMIN_ENDPOINT_KEY`) to be set in
 * the environment. It intentionally fails fast if not configured to avoid
 * accidentally calling production endpoints during local dev.
 */

export async function callAdminEndpoint(path: string, body: any, apiKey?: string) {
  const endpoint = process.env.ADMIN_ENDPOINT;
  if (!endpoint) {
    throw new Error('ADMIN_ENDPOINT is not configured. callAdminEndpoint requires ADMIN_ENDPOINT to be set for test admin operations.');
  }

  // Reject path traversal attempts before constructing URL
  if (path.includes('..') || !/^\/?[-a-zA-Z0-9_.~%/?#&=,;+:]+$/.test(path)) {
    throw new Error(`Invalid path rejected in callAdminEndpoint: ${path}`);
  }
  const url = `${endpoint.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-admin-key'] = apiKey;
  else if (process.env.ADMIN_ENDPOINT_KEY) headers['x-admin-key'] = process.env.ADMIN_ENDPOINT_KEY;

  // Use global fetch when available (Node 18+). If not available, the caller
  // should ensure a fetch polyfill is installed in the environment.
  if (typeof (globalThis as any).fetch !== 'function') {
    throw new Error('Global fetch is not available. Please run tests on Node 18+ or install a fetch polyfill.');
  }

  const res = await (globalThis as any).fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Admin endpoint returned status ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

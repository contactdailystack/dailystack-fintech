/**
 * App Lock — PIN gate (+ optional platform biometric via WebAuthn).
 * Config persists in localStorage; unlock lives in sessionStorage
 * so every new tab/session re-locks.
 */

const KEY = 'pickswise.applock.v1';
const UNLOCK_KEY = 'pickswise.applock.unlocked';
/** Idle minutes before auto-lock */
export const AUTOLOCK_MINUTES = 5;

export interface AppLockConfig {
  enabled: boolean;
  pinHash: string | null;
  salt: string | null;
  /** WebAuthn credential rawId (base64url) when biometric registered */
  biometricId: string | null;
}

const empty: AppLockConfig = { enabled: false, pinHash: null, salt: null, biometricId: null };

function read(): AppLockConfig {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function write(cfg: AppLockConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes))).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Public API ──────────────────────────────────────────────────────

export function loadAppLock(): AppLockConfig {
  return read();
}

export function isLockEnabled(): boolean {
  return read().enabled && !!read().pinHash;
}

export async function setPin(pin: string): Promise<void> {
  const cfg = read();
  const salt = cfg.salt || randomHex(16);
  write({ ...cfg, enabled: true, salt, pinHash: await sha256Hex(`${salt}:${pin}`) });
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  if (!(await verifyPin(currentPin))) return false;
  await setPin(newPin);
  return true;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const cfg = read();
  if (!cfg.pinHash || !cfg.salt) return false;
  const attempt = await sha256Hex(`${cfg.salt}:${pin}`);
  // constant-time-ish compare
  if (attempt.length !== cfg.pinHash.length) return false;
  let diff = 0;
  for (let i = 0; i < attempt.length; i++) diff |= attempt.charCodeAt(i) ^ cfg.pinHash.charCodeAt(i);
  return diff === 0;
}

/** Disable requires the correct PIN (returns false on wrong PIN). */
export async function disableLock(pin: string): Promise<boolean> {
  if (!(await verifyPin(pin))) return false;
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(UNLOCK_KEY);
  return true;
}

// ─── Session unlock state ───────────────────────────────────────────

export function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function markUnlocked(): void {
  try {
    sessionStorage.setItem(UNLOCK_KEY, '1');
  } catch { /* private mode */ }
}

export function lockNow(): void {
  try {
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch { /* noop */ }
}

// ─── Biometric (local WebAuthn platform credential) ─────────────────

export async function biometricAvailable(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false;
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  bytes.forEach(b => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

/** Register this device's fingerprint/face as an unlock method. */
export async function registerBiometric(accountLabel: string): Promise<boolean> {
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'PicksWise' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: accountLabel, displayName: 'PicksWise' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    });
    if (!cred) return false;
    const cfg = read();
    cfg.biometricId = toBase64Url((cred as PublicKeyCredential).rawId);
    write(cfg);
    return true;
  } catch {
    return false;
  }
}

export function hasBiometric(): boolean {
  return !!read().biometricId;
}

/** Unregister this device's biometric unlock. */
export function removeBiometric(): void {
  const cfg = read();
  cfg.biometricId = null;
  write(cfg);
}

/** Prompt platform biometric; resolve true on success. */
export async function unlockWithBiometric(): Promise<boolean> {
  const cfg = read();
  if (!cfg.biometricId) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: 'public-key', id: fromBase64Url(cfg.biometricId) }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

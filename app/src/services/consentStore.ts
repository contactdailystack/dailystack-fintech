/**
 * PDPA consent record — persisted per device.
 * Version bump = re-ask users for consent.
 */

const KEY = 'pickswise.consent.v1';
export const CONSENT_VERSION = '2026-08-24';

export interface ConsentRecord {
  version: string;
  acceptedAt: string;
  /** true = all features; false = essential only */
  analytics: boolean;
}

export function loadConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentRecord {
  const rec: ConsentRecord = { version: CONSENT_VERSION, acceptedAt: new Date().toISOString(), analytics };
  localStorage.setItem(KEY, JSON.stringify(rec));
  return rec;
}

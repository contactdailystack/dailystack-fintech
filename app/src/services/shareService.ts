/**
 * Native share sheet with clipboard fallback.
 * Returns 'shared' | 'copied' | 'failed'.
 */
export async function shareApp(url: string): Promise<'shared' | 'copied' | 'failed'> {
  const title = 'PicksWise';
  const text = typeof navigator !== 'undefined' && navigator.language?.startsWith('th')
    ? 'เจอแอปจัดการการเงินดี ๆ ลองดูนะ'
    : 'Found a great money tracker — check out PicksWise';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e) {
      // AbortError = user closed sheet; anything else falls through to copy
      if ((e as Error)?.name === 'AbortError') return 'failed';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/** Which marketing link brought this browser session (see SourceTracker). */

export const SOURCE_KEY = 'devpath.src';
export const VISIT_KEY = 'devpath.visited';

/**
 * The source in a marketing link (?utm_source=facebook, or ?ref=facebook), lower-cased. Anything that is not a short
 * word is ignored; the API maps unknown words to "other".
 */
export function sourceFromUrl(search: string): string | null {
  const params = new URLSearchParams(search);
  const raw = (params.get('utm_source') ?? params.get('ref') ?? '').trim().toLowerCase();
  return /^[a-z0-9-]{1,20}$/.test(raw) ? raw : null;
}

/** The first source seen in this browser session, or null for a direct visit. */
export function rememberedSource(): string | null {
  try { return sessionStorage.getItem(SOURCE_KEY); } catch { return null; }
}

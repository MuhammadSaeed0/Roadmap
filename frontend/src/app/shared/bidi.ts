/** Latin text, numbers and punctuation: anything outside the Arabic Unicode blocks. */
const LATIN_RUN = /[^؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g;

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Arabic text often quotes English terms and code ('المفوِّضات Delegates وFunc'). Laid out right-to-left, the
 * browser can reorder those runs and their punctuation, so in Arabic each Latin run is isolated in a left-to-right
 * <bdi>. The text is HTML-escaped first, and Angular sanitizes the result when it is bound to [innerHTML].
 */
export function isolateLatin(text: string | null | undefined, lang: string): string {
  const escaped = escapeHtml(text ?? '');
  if (lang !== 'ar') return escaped;
  return escaped.replace(LATIN_RUN, run => {
    const m = /^(\s*)(.*?)([.,:!?]?\s*)$/s.exec(run)!;
    return /[A-Za-z0-9]/.test(m[2]) ? `${m[1]}<bdi dir="ltr">${m[2]}</bdi>${m[3]}` : run;
  });
}

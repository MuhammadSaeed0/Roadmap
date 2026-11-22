import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { GlossaryTerm } from './models';

/** A piece of lesson text: plain, inline code, or a glossary term on its first use in the lesson. */
export interface TermSpan { text: string; code: boolean; term?: GlossaryTerm; }

/** At most this many terms are marked per lesson, so the text stays easy to read. */
export const MAX_TERMS_PER_LESSON = 6;

/** The glossary, loaded once on first use and shared by every lesson. */
@Injectable({ providedIn: 'root' })
export class GlossaryService {
  private readonly api = inject(ApiService);
  private loading: Promise<void> | null = null;
  readonly terms = signal<GlossaryTerm[]>([]);

  load(): Promise<void> {
    this.loading ??= Promise.resolve()
      .then(() => this.api.glossary())
      .then(list => this.terms.set(list))
      .catch(() => { this.loading = null; }); // no glossary: lessons simply show plain text
    return this.loading;
  }
}

/** One regular expression for all terms, longest first so "clustered index" wins over "index". */
export function termMatcher(terms: readonly GlossaryTerm[]): { regex: RegExp; byKey: Map<string, GlossaryTerm> } | null {
  // Terms with a qualifier, such as "repository (Git)", only appear in the glossary itself.
  const usable = terms.filter(t => !t.term.includes('('));
  if (usable.length === 0) return null;
  const byKey = new Map(usable.map(t => [t.term.toLowerCase(), t]));
  const escaped = [...byKey.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
  return { regex: new RegExp(`(?<![\\p{L}\\p{N}_])(${escaped.join('|')})(?![\\p{L}\\p{N}_])`, 'giu'), byKey };
}

/**
 * Marks the first use of each glossary term in a lesson. `used` carries over between the lesson's paragraphs,
 * so a term is marked once per lesson; code spans are never touched.
 */
export function markTerms(spans: readonly { text: string; code: boolean }[], matcher: ReturnType<typeof termMatcher>, used: Set<string>): TermSpan[] {
  if (!matcher) return spans.map(s => ({ ...s }));
  const out: TermSpan[] = [];
  for (const span of spans) {
    if (span.code || used.size >= MAX_TERMS_PER_LESSON) { out.push({ ...span }); continue; }
    let last = 0;
    matcher.regex.lastIndex = 0;
    for (const m of span.text.matchAll(matcher.regex)) {
      const key = m[0].toLowerCase();
      const term = matcher.byKey.get(key);
      if (!term || used.has(key) || used.size >= MAX_TERMS_PER_LESSON) continue;
      used.add(key);
      if (m.index > last) out.push({ text: span.text.slice(last, m.index), code: false });
      out.push({ text: m[0], code: false, term });
      last = m.index + m[0].length;
    }
    if (last < span.text.length) out.push({ text: span.text.slice(last), code: false });
  }
  return out;
}

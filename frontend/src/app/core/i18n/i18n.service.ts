import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ar } from './ar';
import { en, Translations } from './en';

export type Lang = 'en' | 'ar';
type Params = Record<string, string | number | null | undefined>;

const STORAGE_KEY = 'devpath.lang';
const dictionaries: Record<Lang, Translations> = { en, ar };
/** Sections registered by lazily loaded pages (see registerTranslations). */
const extensions: Record<Lang, Record<string, unknown>> = { en: {}, ar: {} };

/**
 * Adds translation sections that ship with a lazily loaded part of the app (the code editor, the playground)
 * instead of with the first download. Call it at the top of the module that uses them.
 */
export function registerTranslations(enSections: object, arSections: object): void {
  Object.assign(extensions.en, enSections);
  Object.assign(extensions.ar, arSections);
}

function find(lang: Lang, key: string): unknown {
  return lookup(dictionaries[lang], key) ?? lookup(extensions[lang], key);
}

/**
 * Lightweight translation service.
 * - `lang` is a signal, so every template that reads a translation re-renders when it changes.
 * - Switching language updates <html lang> and <html dir> (ltr/rtl) and is saved in localStorage.
 * - Learning content comes from the API in both languages; `pick()` chooses the right field.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly lang = signal<Lang>(readSavedLang());
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));
  readonly isRtl = computed(() => this.lang() === 'ar');
  /** Arabic month/day names with Western digits — easier to read next to code and percentages. */
  readonly locale = computed(() => (this.lang() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB'));

  constructor() {
    effect(() => {
      const lang = this.lang();
      const html = this.document.documentElement;
      html.lang = lang;
      html.dir = this.dir();
      this.title.setTitle(dictionaries[lang].app.fullName);
      try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable: preference just isn't remembered */ }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  toggle(): void {
    this.lang.update(l => (l === 'en' ? 'ar' : 'en'));
  }

  /** Translate a dotted key such as "nav.dashboard", replacing {placeholders}. */
  t(key: string, params?: Params): string {
    const value = find(this.lang(), key) ?? find('en', key);
    if (typeof value !== 'string') return key;
    return this.bidi(params ? interpolate(value, params) : value);
  }

  /** Whether a key exists (used for optional translations such as API error codes). */
  has(key: string): boolean {
    return typeof find(this.lang(), key) === 'string';
  }

  /** Pick the English or Arabic version of a field; falls back to English when Arabic is empty. */
  pick(en: string | null | undefined, ar: string | null | undefined): string {
    return this.lang() === 'ar' ? this.bidi(ar || en || '') : (en || ar || '');
  }

  /**
   * In right-to-left text, neutral characters next to Latin words get reordered:
   * "C#" shows as "#C", ".NET" as "NET." and "First()" as "()First". Adding an
   * invisible left-to-right mark (U+200E) keeps them attached to the Latin word.
   */
  private bidi(text: string): string {
    if (this.lang() !== 'ar' || !text) return text;
    return text
      .replace(/([A-Za-z])#/g, '$1#‎')
      .replace(/(^|[\s(«])\.([A-Za-z])/g, '$1‎.$2')
      .replace(/([A-Za-z0-9_])(\(\)|\[\]|<T>)/g, '$1$2‎')
      // "409 Conflict" would otherwise render as "Conflict 409"
      .replace(/(^|[\s(])(\d+(?:\.\d+)?)(?=\s+[A-Za-z])/g, '$1‎$2');
  }

  /** Read `${field}En` / `${field}Ar` from an object. */
  loc(obj: object | null | undefined, field: string): string {
    if (!obj) return '';
    const record = obj as Record<string, unknown>;
    return this.pick(record[`${field}En`] as string | null, record[`${field}Ar`] as string | null);
  }

  /**
   * Translate a server "reason" (code + params). Params that come in En/Ar pairs
   * (en/ar, projectEn/projectAr) are collapsed into the current language.
   */
  reason(prefix: string, code: string, params: Record<string, string> | null | undefined): string {
    const p: Params = { ...(params ?? {}) };
    const localized = this.pick(params?.['en'], params?.['ar']);
    if (localized) { p['title'] = localized; p['name'] = localized; }
    if (params?.['projectEn']) p['project'] = this.pick(params['projectEn'], params['projectAr']);
    return this.t(`${prefix}.${code}`, p);
  }

  /** Message for an API error code, falling back to a generic message. */
  errorMessage(error: { code: string; status?: number } | null | undefined): string {
    if (!error) return '';
    return this.has(`errors.codes.${error.code}`) ? this.t(`errors.codes.${error.code}`) : this.t('errors.generic');
  }

  formatNumber(value: number, maxFractionDigits = 0): string {
    return new Intl.NumberFormat(this.locale(), { maximumFractionDigits: maxFractionDigits }).format(value);
  }

  formatDate(value: string | Date | null | undefined, style: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!value) return '';
    // Date-only strings ("2026-10-19") are local dates, not UTC midnight.
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    const options: Intl.DateTimeFormatOptions =
      style === 'short' ? { day: 'numeric', month: 'short' }
      : style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat(this.locale(), options).format(date);
  }

  /** "3 days ago", "in 2 days" … */
  formatRelative(value: string | Date): string {
    const diffMs = new Date(value).getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat(this.locale(), { numeric: 'auto' });
    const minutes = Math.round(diffMs / 60000);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
    return rtf.format(Math.round(hours / 24), 'day');
  }

  /** 95 → "1 h 35 min" */
  formatDuration(minutes: number): string {
    if (minutes < 60) return this.t('common.minutes', { n: minutes });
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? this.t('common.hours', { n: h }) : `${this.t('common.hours', { n: h })} ${this.t('common.minutes', { n: m })}`;
  }
}

function readSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  } catch {
    return 'en';
  }
}

function lookup(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), dict);
}

function interpolate(text: string, params: Params): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === null || value === undefined ? match : String(value);
  });
}

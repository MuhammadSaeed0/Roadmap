import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function create(): I18nService {
    const service = TestBed.inject(I18nService);
    TestBed.tick();   // run effects (document direction, storage)
    return service;
  }

  it('defaults to English and left-to-right', () => {
    const i18n = create();
    expect(i18n.lang()).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(i18n.t('nav.dashboard')).toBe('Dashboard');
  });

  it('switching to Arabic updates translations, <html dir> and localStorage', () => {
    const i18n = create();
    i18n.setLang('ar');
    TestBed.tick();
    expect(i18n.t('nav.dashboard')).toBe('لوحة المعلومات');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(localStorage.getItem('devpath.lang')).toBe('ar');
  });

  it('restores the saved language on the next visit', () => {
    localStorage.setItem('devpath.lang', 'ar');
    expect(create().lang()).toBe('ar');
  });

  it('interpolates parameters', () => {
    expect(create().t('common.showing', { from: 1, to: 20, total: 144 })).toBe('1–20 of 144');
  });

  it('returns the key for unknown translations instead of crashing', () => {
    expect(create().t('does.not.exist')).toBe('does.not.exist');
  });

  it('picks the Arabic field and falls back to English when Arabic is missing', () => {
    const i18n = create();
    i18n.setLang('ar');
    expect(i18n.pick('Loops', 'الحلقات التكرارية')).toBe('الحلقات التكرارية');
    expect(i18n.pick('Only English', '')).toBe('Only English');
  });

  it('keeps "C#" and ".NET" in the right order inside Arabic text', () => {
    const i18n = create();
    i18n.setLang('ar');
    expect(i18n.pick('', 'أساسيات C#')).toBe('أساسيات C#‎');
    expect(i18n.pick('', 'باستخدام .NET')).toBe('باستخدام ‎.NET');
    // English text is never modified
    i18n.setLang('en');
    expect(i18n.pick('C# basics', '')).toBe('C# basics');
  });

  it('maps API error codes to translated messages', () => {
    const i18n = create();
    expect(i18n.errorMessage({ code: 'attempt_required' })).toContain('attempt');
    expect(i18n.errorMessage({ code: 'something_new' })).toBe('Unexpected error.');
  });
});

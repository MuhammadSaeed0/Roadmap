import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { adminGuard } from '../../core/auth.guard';
import { I18nService } from '../../core/i18n/i18n.service';
import { routes } from '../../app.routes';
import { APP_URL, KIT, KIT_KINDS, LEARNER_POST_AR, LEARNER_POST_EN, LEARNER_SOURCES, POST_AR, POST_EN, SHOTS, SOURCES } from './marketing.content';
import MarketingPage from './marketing.page';

async function render(lang: 'en' | 'ar' = 'en', admin = true): Promise<{ el: HTMLElement; fixture: ComponentFixture<MarketingPage> }> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(AuthService).account.set({
    id: 'u', email: 'u@example.com', fullName: 'U', createdAt: '2026-01-01', status: 'Approved', emailVerified: true,
    isAdmin: admin, isOwner: false, statusReason: null,
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(MarketingPage);
  fixture.detectChanges();
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

const textarea = (el: HTMLElement) => el.querySelector<HTMLTextAreaElement>('#mk-text')!;
const button = (el: HTMLElement, label: string) =>
  [...el.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.includes(label))!;

describe('Marketing Studio', () => {
  // Choosing a language saves it in localStorage; clear it so later spec files start in their default language.
  afterEach(() => {
    for (const key of Object.keys(localStorage)) if (key.startsWith('devpath.')) localStorage.removeItem(key);
  });

  it('gives every growth-kit piece a tracked link and keeps its claims honest', () => {
    // The API keeps only these sources (UsageService.Sources); anything else would be counted as "other".
    const apiSources = ['direct', 'facebook', 'whatsapp', 'telegram', 'linkedin', 'reddit', 'tiktok', 'instagram', 'youtube',
      'discord', 'github', 'google', 'devto', 'friend', 'other'];
    for (const s of SOURCES) expect(apiSources, s).toContain(s);
    for (const kind of KIT_KINDS) expect(KIT.some(i => i.kind === kind), kind).toBe(true);
    expect(KIT.filter(i => i.kind === 'facebook').length).toBe(5);
    expect(KIT.filter(i => i.kind === 'video').length).toBe(5);
    expect(new Set(KIT.map(i => i.id)).size).toBe(KIT.length);
    for (const item of KIT) {
      expect(item.text, item.id).toMatch(/\?utm_source=[a-z]+/);
      // No leaderboard (the app has none), no stale counts, no invented praise.
      expect(item.text, item.id).not.toMatch(/leaderboard|لوحة ترتيب|178|testimonial/i);
      if (item.lang === 'ar') expect(item.text.replace(/‎\.NET|ASP\.NET/g, ''), item.id).not.toContain('.NET');
    }
  });

  it('lists the growth kit by channel with copy buttons and the Reddit rules note', async () => {
    const { el, fixture } = await render('ar');
    expect(el.querySelectorAll('.mk-links li').length).toBe(SOURCES.length);
    expect(el.querySelectorAll('.mk-item').length).toBe(5);
    button(el, 'ريديت').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.mk-item').length).toBe(KIT.filter(i => i.kind === 'reddit').length);
    expect(el.querySelector('.mk-growth .callout')?.textContent).toContain('قواعد');
    expect(el.querySelector('.mk-item-text')?.getAttribute('dir')).toBe('ltr');
  });

  it('is open to every signed-in learner, not only administrators', () => {
    const route = routes.find(r => r.path === 'marketing');
    expect(route?.canActivate ?? []).not.toContain(adminGuard);
  });

  it('gives a learner posts in their own voice and hides the owner\'s posts and campaigns', async () => {
    const { el, fixture } = await render('ar', false);
    expect(el.querySelector('h1')?.textContent).toContain('ادعُ أصدقاءك');
    expect(textarea(el).value).toBe(LEARNER_POST_AR);
    for (const post of [LEARNER_POST_AR, LEARNER_POST_EN]) {
      expect(post).toContain('utm_source=friend');
      expect(post).not.toMatch(/عملت|بنيت|I built/);
    }
    expect(el.querySelectorAll('.mk-links li').length).toBe(LEARNER_SOURCES.length);
    // Only learner-voice pieces, and no tabs for the owner's channels.
    const labels = [...el.querySelectorAll('.mk-kinds button')].map(b => b.textContent?.trim());
    expect(labels).toEqual(['لينكدإن', 'الأصدقاء']);
    expect(el.textContent).not.toContain('ريديت');
    for (const k of ['لينكدإن', 'الأصدقاء']) {
      button(el, k).click();
      fixture.detectChanges();
      for (const item of el.querySelectorAll('.mk-item-text')) expect(item.textContent).not.toMatch(/عملت موقع|I built|I'm a \.NET/);
    }
    expect(KIT.filter(i => i.audience === 'all').every(i => !/عملت|بنيت|I built|I maintain|I run/.test(i.text))).toBe(true);
  });

  it('keeps the post honest: the real link, both languages, and the numbers the app has', () => {
    for (const post of [POST_AR, POST_EN]) {
      expect(post).toContain(APP_URL);
      for (const fact of ['14', '166', '250', '97', '66']) expect(post, fact).toContain(fact);
    }
    expect(/[؀-ۿ]/.test(POST_AR)).toBe(true);
    // Arabic lines carry a left-to-right mark next to .NET and C# so Facebook keeps them readable.
    expect(POST_AR).toContain('‎.NET');
    expect(POST_AR).toContain('C#‎');
  });

  it('lists every screenshot once, in posting order, cover first', () => {
    expect(SHOTS[0].device).toBe('cover');
    expect(new Set(SHOTS.map(s => s.file)).size).toBe(SHOTS.length);
    expect(SHOTS.map(s => s.file)).toEqual([...SHOTS.map(s => s.file)].sort());
    for (const s of SHOTS) expect(s.file).toMatch(/^\d\d-[a-z-]+\.jpg$/);
  });

  it('shows the Arabic post for an Arabic reader and switches to English', async () => {
    const { el, fixture } = await render('ar');
    expect(textarea(el).value).toBe(POST_AR);
    expect(textarea(el).getAttribute('dir')).toBe('rtl');
    button(el, 'الإنجليزية').click();
    fixture.detectChanges();
    expect(textarea(el).value).toBe(POST_EN);
    expect(textarea(el).getAttribute('dir')).toBe('ltr');
  });

  it('copies the edited text, and Reset brings back the original', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { el, fixture } = await render();
    textarea(el).value = 'My own words';
    textarea(el).dispatchEvent(new Event('input'));
    fixture.detectChanges();
    button(el, 'Copy post').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith('My own words');
    expect(button(el, 'Copied')).toBeTruthy();

    button(el, 'Reset').click();
    fixture.detectChanges();
    expect(textarea(el).value).toBe(POST_EN);
    expect(button(el, 'Reset')).toBeUndefined();
  });

  it('offers every screenshot to view and download, with a link-only Facebook share', async () => {
    const { el } = await render();
    const items = el.querySelectorAll('.mk-shot');
    expect(items.length).toBe(SHOTS.length);
    const downloads = [...el.querySelectorAll<HTMLAnchorElement>('.mk-download')];
    expect(downloads.map(a => a.getAttribute('href'))).toEqual(SHOTS.map(s => 'marketing/' + s.file));
    expect(downloads.every(a => a.getAttribute('download')?.startsWith('devpath-'))).toBe(true);
    expect(el.querySelector<HTMLAnchorElement>('.mk-fb')?.href).toBe('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(APP_URL));
    expect(el.textContent).toContain('Download all');
  });
});

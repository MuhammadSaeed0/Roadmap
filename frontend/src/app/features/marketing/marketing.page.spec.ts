import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { adminGuard } from '../../core/auth.guard';
import { I18nService } from '../../core/i18n/i18n.service';
import { routes } from '../../app.routes';
import { APP_URL, POST_AR, POST_EN, SHOTS } from './marketing.content';
import MarketingPage from './marketing.page';

async function render(lang: 'en' | 'ar' = 'en'): Promise<{ el: HTMLElement; fixture: ComponentFixture<MarketingPage> }> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
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
  it('is an administrator-only page', () => {
    const route = routes.find(r => r.path === 'marketing');
    expect(route?.canActivate).toContain(adminGuard);
  });

  it('keeps the post honest: the real link, both languages, and the numbers the app has', () => {
    for (const post of [POST_AR, POST_EN]) {
      expect(post).toContain(APP_URL);
      for (const fact of ['14', '166', '178', '97', '66']) expect(post, fact).toContain(fact);
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

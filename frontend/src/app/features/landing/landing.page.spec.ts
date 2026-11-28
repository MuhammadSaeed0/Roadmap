import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService, browserLang } from '../../core/i18n/i18n.service';
import LandingPage from './landing.page';

const never = () => new Promise<never>(() => undefined);

/** A stand-in for AuthService: signed out (null) or an approved learner. */
function auth(account: { status: string } | null) {
  const value = signal(account as never);
  return {
    account: value, ready: signal(true), approved: () => account?.status === 'Approved', isAdmin: () => false,
    displayName: () => 'Mona', restore: () => Promise.resolve(),
  };
}

async function openRoot(account: { status: string } | null, url = '/') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: AuthService, useValue: auth(account) },
      // Every API call stays pending: these tests only check which page "/" opens.
      { provide: ApiService, useValue: new Proxy({}, { get: () => never }) },
    ],
  });
  TestBed.inject(I18nService).lang.set('en');
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return harness;
}

describe('Landing page', () => {
  it('is what "/" shows a visitor without an account', async () => {
    const harness = await openRoot(null);
    const el = harness.routeNativeElement!;
    expect(el.querySelector('h1')?.textContent).toContain('From your first line of code to your first developer job');
    expect(el.querySelector('a.ld-cta')?.getAttribute('href')).toBe('/sign-up');
    expect(el.querySelector('a[href="/sign-in"]')).not.toBeNull();
  });

  it('is never shown to a signed-in learner: "/" stays the dashboard', async () => {
    const harness = await openRoot({ status: 'Approved' });
    expect(harness.routeNativeElement?.querySelector('.ld-hero')).toBeNull();
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-dashboard-page');
  });

  it('shows the real numbers and real screenshots, loaded lazily', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect([...el.querySelectorAll('.ld-fact dd')].map(d => d.textContent?.trim())).toEqual(['28', '265', '350+', '97', '80', '1,100+']);
    const images = [...el.querySelectorAll<HTMLImageElement>('.ld-shots img')];
    expect(images.length).toBe(4);
    expect(images.every(i => i.getAttribute('src')!.startsWith('marketing/') && i.getAttribute('loading') === 'lazy' && i.alt.length > 0)).toBe(true);
    // Small WebP copies, not the full-size marketing JPEGs, so they don't hold up the next page's download.
    expect(images.map(i => i.getAttribute('src'))).toEqual([
      'marketing/web/01-roadmap.webp', 'marketing/web/03-lesson.webp', 'marketing/web/04-playground.webp', 'marketing/web/06-project-library.webp',
    ]);
    // Beginners can open the public Pre-Roadmap guide without an account, from the top and from its feature card.
    expect(el.querySelectorAll('a[href="/pre-roadmap"]').length).toBe(2);
    expect(el.querySelector('.ld-pre')?.textContent).toContain('Never coded before?');
    // Create account, Start here and Sign in stand out the same way at the top.
    const hero = [...el.querySelectorAll<HTMLAnchorElement>('.ld-actions a')];
    expect(hero.map(a => a.getAttribute('href'))).toEqual(['/sign-up', '/pre-roadmap', '/sign-in']);
    expect(hero.every(a => a.classList.contains('btn-primary') && a.classList.contains('ld-cta'))).toBe(true);
  });

  it('opens in Arabic for a first visit from an Arabic browser', () => {
    const spy = vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ar-EG', 'en']);
    try {
      expect(browserLang()).toBe('ar');
    } finally {
      spy.mockRestore();
    }
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    expect(browserLang()).toBe('en');
    vi.restoreAllMocks();
  });

  it('lets a visitor without an account read the Pre-Roadmap guide in the public layout', async () => {
    const harness = await openRoot(null, '/pre-roadmap');
    expect(TestBed.inject(Router).url).toBe('/pre-roadmap');
    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('app-pre-roadmap-page');
    const route = routes.find(r => r.path === 'pre-roadmap' && r.canMatch);
    expect(route?.data?.['layout']).toBe('auth');
  });

  it('still sends a visitor without an account from app pages to sign-in', async () => {
    for (const url of ['/roadmap', '/topics/12', '/practice']) {
      TestBed.resetTestingModule();
      await openRoot(null, url);
      expect(TestBed.inject(Router).url).toMatch(/^\/sign-in\?returnUrl=/);
    }
  });
});

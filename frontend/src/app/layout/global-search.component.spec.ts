import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n/i18n.service';
import { GlobalSearchComponent, NARROW_QUERY, readRecentSearches, rememberSearch } from './global-search.component';

/** Pretends the window is (or isn't) 600px wide or narrower. */
function stubWidth(narrow: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query === NARROW_QUERY && narrow, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 3; i++) { fixture.detectChanges(); await fixture.whenStable(); await new Promise(r => setTimeout(r, 0)); }
  fixture.detectChanges();
}

describe('GlobalSearchComponent', () => {
  const original = window.matchMedia;
  const proto = HTMLDialogElement.prototype;
  const { showModal, close } = proto;

  beforeEach(() => {
    localStorage.removeItem('devpath.search.recent');
    // jsdom may lack modal dialogs: a minimal stand-in that toggles [open].
    proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
    proto.close = function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  });
  afterEach(() => { window.matchMedia = original; proto.showModal = showModal; proto.close = close; });

  function setup(narrow: boolean) {
    stubWidth(narrow);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ApiService, useValue: { search: (q: string) => Promise.resolve({ query: q, groups: [] }) } }],
    });
    TestBed.inject(I18nService).lang.set('en');
    return TestBed.createComponent(GlobalSearchComponent);
  }

  it('shows only a search button on narrow screens and the field on wide ones', async () => {
    const phone = setup(true);
    await settle(phone);
    const el = phone.nativeElement as HTMLElement;
    expect(el.querySelector('.search-trigger')?.getAttribute('aria-label')).toBe('Open search');
    expect(el.querySelector('.global-search')).toBeNull();

    TestBed.resetTestingModule();
    const desktop = setup(false);
    await settle(desktop);
    const wide = desktop.nativeElement as HTMLElement;
    expect(wide.querySelector('.search-trigger')).toBeNull();
    expect(wide.querySelector('.global-search input')).not.toBeNull();
  });

  it('opens a search dialog with the input focused and recent searches, and closes it with Esc or the close button', async () => {
    rememberSearch('linq');
    rememberSearch('records');
    const fixture = setup(true);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector<HTMLDialogElement>('dialog.search-overlay')!;
    expect(dialog.getAttribute('aria-label')).toBe('Search DevPath');
    expect(dialog.hasAttribute('open')).toBe(false);

    el.querySelector<HTMLButtonElement>('.search-trigger')!.click();
    await settle(fixture);
    expect(dialog.hasAttribute('open')).toBe(true);
    const input = dialog.querySelector<HTMLInputElement>('input')!;
    expect(document.activeElement).toBe(input);
    expect([...dialog.querySelectorAll('.recent-hit')].map(b => b.textContent?.trim())).toEqual(['records', 'linq']);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);
    expect(dialog.hasAttribute('open')).toBe(false);

    el.querySelector<HTMLButtonElement>('.search-trigger')!.click();
    await settle(fixture);
    dialog.querySelector<HTMLButtonElement>('button[aria-label="Close search"]')!.click();
    await settle(fixture);
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('keeps the last 5 distinct searches, newest first', () => {
    for (const q of ['a1', 'b2', 'c3', 'd4', 'e5', 'B2', 'x']) rememberSearch(q);
    expect(readRecentSearches()).toEqual(['B2', 'e5', 'd4', 'c3', 'a1']);
    localStorage.setItem('devpath.search.recent', 'not json');
    expect(readRecentSearches()).toEqual([]);
  });
});

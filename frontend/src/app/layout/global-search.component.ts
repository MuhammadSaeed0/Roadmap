import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationBehaviorOptions, Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { LocalizePipe, TranslatePipe } from '../core/i18n/pipes';
import { SearchCategory, SearchHit, SearchResult } from '../core/models';
import { IconComponent } from '../shared/icon.component';

const ICONS: Record<SearchCategory, string> = {
  topics: 'book', projects: 'folder', tasks: 'check-circle', practice: 'code', interview: 'chat', resources: 'link', notes: 'note', discussions: 'message-square',
};

const RECENT_KEY = 'devpath.search.recent';
const RECENT_MAX = 5;
export const NARROW_QUERY = '(max-width: 600px)';

/** The last searches on this device, newest first. Storage may be blocked (private mode), so every access is guarded. */
export function readRecentSearches(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((q): q is string => typeof q === 'string').slice(0, RECENT_MAX) : [];
  } catch { return []; }
}

export function rememberSearch(query: string): string[] {
  const q = query.trim();
  const list = q.length < 2 ? readRecentSearches()
    : [q, ...readRecentSearches().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, RECENT_MAX);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* storage unavailable: keep it in memory only */ }
  return list;
}

/**
 * Search-as-you-type in the top bar. Press "/" anywhere to focus it.
 * On phones (600px and narrower) the bar shows only a search button, which opens a full-width search dialog
 * with the same results and the last few searches. Esc, the close button or the browser's back button close it.
 */
@Component({
  selector: 'app-global-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, NgTemplateOutlet],
  template: `
    @if (narrow()) {
    <button type="button" class="icon-btn search-trigger" [attr.aria-label]="'search.open' | t" [title]="'search.open' | t"
            aria-haspopup="dialog" (click)="openOverlay()">
      <app-icon name="search" [size]="18" />
    </button>
    } @else {
    <div class="global-search" [class.open]="open()">
      <app-icon name="search" [size]="16" class="search-icon" />
      <input #input type="search" role="combobox" aria-autocomplete="list" aria-controls="search-results"
             [attr.aria-expanded]="open()" [attr.aria-activedescendant]="activeId()"
             [placeholder]="'search.placeholder' | t" [attr.aria-label]="'nav.search' | t"
             [value]="query()" (input)="onInput($any($event.target).value)"
             (keydown)="onKeydown($event)" (focus)="open.set(query().length >= 2)" />

      @if (open() && !overlay()) {
        <div class="search-panel" id="search-results" role="listbox">
          <ng-container *ngTemplateOutlet="results" />
        </div>
      }
    </div>
    }

    <dialog #dialog class="search-overlay" [attr.aria-label]="'search.dialog' | t" (cancel)="$event.preventDefault(); closeOverlay()"
            (close)="onDialogClosed()">
      @if (overlay()) {
        <div class="search-overlay-bar">
          <div class="global-search">
            <app-icon name="search" [size]="16" class="search-icon" />
            <input #overlayInput type="search" role="combobox" aria-autocomplete="list" aria-controls="search-results-sheet"
                   [attr.aria-expanded]="open()" [attr.aria-activedescendant]="activeId()"
                   [placeholder]="'search.placeholder' | t" [attr.aria-label]="'nav.search' | t"
                   [value]="query()" (input)="onInput($any($event.target).value)" (keydown)="onKeydown($event)" />
          </div>
          <button type="button" class="icon-btn" [attr.aria-label]="'search.close' | t" [title]="'search.close' | t" (click)="closeOverlay()">
            <app-icon name="x" [size]="18" />
          </button>
        </div>
        <div class="search-overlay-body">
          @if (open()) {
            <div id="search-results-sheet" role="listbox"><ng-container *ngTemplateOutlet="results" /></div>
          } @else if (query().trim().length < 2 && recent().length) {
            <div class="search-group" role="group" aria-labelledby="recent-searches-h">
              <p class="search-group-title" id="recent-searches-h">{{ 'search.recent' | t }}</p>
              @for (q of recent(); track q) {
                <button type="button" class="search-hit recent-hit" (click)="useRecent(q)">
                  <app-icon name="clock" [size]="16" /> <span class="hit-text"><span class="hit-title">{{ q }}</span></span>
                </button>
              }
            </div>
          } @else if (query().trim().length < 2) {
            <p class="search-hint">{{ 'search.minChars' | t }}</p>
          }
        </div>
      }
    </dialog>

    <ng-template #results>
          @if (loading() && !result()) {
            <p class="search-hint">{{ 'common.loading' | t }}</p>
          } @else if (flat().length === 0) {
            <p class="search-hint">{{ 'search.noResults' | t: { q: query() } }}</p>
          } @else {
            @for (group of result()!.groups; track group.category) {
              <div class="search-group" role="group" [attr.aria-label]="'search.categories.' + group.category | t">
                <p class="search-group-title">{{ 'search.categories.' + group.category | t }}</p>
                @for (hit of group.items; track hit.id) {
                  <button type="button" role="option" class="search-hit" [id]="'sr-' + group.category + '-' + hit.id"
                          [class.active]="activeId() === 'sr-' + group.category + '-' + hit.id"
                          (mousedown)="$event.preventDefault()" (click)="go(group.category, hit)">
                    <app-icon [name]="icon(group.category)" [size]="16" />
                    <span class="hit-text">
                      <span class="hit-title">{{ hit | loc: 'title' }}</span>
                      @if (hit.subtitleEn) { <span class="hit-sub">{{ hit | loc: 'subtitle' }}</span> }
                    </span>
                  </button>
                }
              </div>
            }
            <button type="button" class="search-all" (mousedown)="$event.preventDefault()" (click)="viewAll()">
              {{ 'search.resultsFor' | t: { q: query() } }} <app-icon name="arrow-right" [size]="14" />
            </button>
          }
    </ng-template>
  `,
})
export class GlobalSearchComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly overlayInput = viewChild<ElementRef<HTMLInputElement>>('overlayInput');

  protected readonly query = signal('');
  protected readonly result = signal<SearchResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  /** The phone search dialog is open. */
  protected readonly overlay = signal(false);
  protected readonly recent = signal<string[]>([]);
  /** A history entry was added when the dialog opened, so the browser's back button closes it. */
  private historyEntry = false;
  private readonly onPopState = () => {
    if (!this.overlay()) return;
    this.historyEntry = false;
    this.closeOverlay();
  };
  private timer: ReturnType<typeof setTimeout> | undefined;
  private requestId = 0;

  protected readonly flat = computed(() =>
    (this.result()?.groups ?? []).flatMap(g => g.items.map(hit => ({ category: g.category, hit }))));
  protected readonly activeId = computed(() => {
    const item = this.flat()[this.active()];
    return item ? `sr-${item.category}-${item.hit.id}` : null;
  });

  /** Phones (600px and narrower) get the search button and dialog instead of the field in the bar. */
  protected readonly narrow = signal(false);

  constructor() {
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(NARROW_QUERY) : null;
    this.narrow.set(!!media?.matches);
    const onMedia = (e: MediaQueryListEvent) => {
      this.narrow.set(e.matches);
      if (!e.matches) this.closeOverlay();
    };
    media?.addEventListener?.('change', onMedia);
    window.addEventListener('popstate', this.onPopState);
    inject(DestroyRef).onDestroy(() => {
      media?.removeEventListener?.('change', onMedia);
      window.removeEventListener('popstate', this.onPopState);
    });
  }

  protected icon(category: SearchCategory): string { return ICONS[category]; }

  protected openOverlay(): void {
    this.recent.set(readRecentSearches());
    this.open.set(this.query().trim().length >= 2);
    this.overlay.set(true);
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal();   // a modal dialog keeps focus inside it until it closes
    try { history.pushState({ ...history.state, searchOverlay: true }, ''); this.historyEntry = true; } catch { this.historyEntry = false; }
    // The input is created by the @if above; focus it once it is on the page.
    setTimeout(() => this.overlayInput()?.nativeElement.focus());
  }

  /** Closes the phone search dialog (Esc, the close button, the back button, or after choosing a result). */
  protected closeOverlay(): void {
    if (!this.overlay()) return;
    this.overlay.set(false);
    this.open.set(false);
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
    if (this.historyEntry) { this.historyEntry = false; history.back(); }
  }

  /** The browser closed the dialog by itself (e.g. on some mobile gestures): keep the state in step. */
  protected onDialogClosed(): void {
    if (this.overlay()) this.closeOverlay();
  }

  protected useRecent(q: string): void {
    this.onInput(q);
    this.overlayInput()?.nativeElement.focus();
  }

  /**
   * Leaving through a result. The page that opens replaces the dialog's history entry (returns true),
   * so Back from it returns to where the search started rather than to an empty dialog.
   */
  private leaveOverlay(replace = true): boolean {
    rememberSearch(this.query());
    if (!this.overlay()) return false;
    if (replace) this.historyEntry = false;
    this.closeOverlay();
    return replace;
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.active.set(-1);
    clearTimeout(this.timer);
    if (value.trim().length < 2) { this.open.set(false); this.result.set(null); return; }
    this.open.set(true);
    this.loading.set(true);
    // Debounce: wait until typing pauses before calling the API.
    this.timer = setTimeout(() => void this.search(value.trim()), 250);
  }

  private async search(q: string): Promise<void> {
    const id = ++this.requestId;
    try {
      const result = await this.api.search(q);
      if (id === this.requestId) this.result.set(result);
    } catch {
      if (id === this.requestId) this.result.set({ query: q, groups: [] });
    } finally {
      if (id === this.requestId) this.loading.set(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.flat().length;
    if (event.key === 'ArrowDown' && count) { event.preventDefault(); this.active.update(i => (i + 1) % count); }
    else if (event.key === 'ArrowUp' && count) { event.preventDefault(); this.active.update(i => (i <= 0 ? count - 1 : i - 1)); }
    else if (event.key === 'Escape') { if (this.overlay()) { event.preventDefault(); this.closeOverlay(); } else this.open.set(false); }
    else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.flat()[this.active()];
      if (item) this.go(item.category, item.hit); else this.viewAll();
    }
  }

  protected go(category: SearchCategory, hit: SearchHit): void {
    // Resources open in a new tab, so this page stays and the dialog's history entry is simply undone.
    const replaceUrl = this.leaveOverlay(category !== 'resources');
    this.open.set(false);
    navigateToHit(this.router, category, hit, { replaceUrl });
  }

  protected viewAll(): void {
    if (this.query().trim().length < 2) return;
    const replaceUrl = this.leaveOverlay();
    this.open.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: this.query().trim() }, replaceUrl });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.overlay() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}

/** Shared by the dropdown and the full search page. */
export function navigateToHit(router: Router, category: SearchCategory, hit: SearchHit, extras: NavigationBehaviorOptions = {}): void {
  switch (category) {
    case 'topics': void router.navigate(['/topics', hit.id], extras); break;
    case 'projects': void router.navigate(['/projects', hit.id], extras); break;
    case 'tasks': void router.navigate(['/projects', hit.parentId], { ...extras, fragment: `task-${hit.id}` }); break;
    case 'practice': void router.navigate(['/practice', hit.id], extras); break;
    case 'interview': void router.navigate(['/interviews'], { ...extras, queryParams: { question: hit.id } }); break;
    case 'notes': void router.navigate(['/notes'], { ...extras, queryParams: { id: hit.id } }); break;
    case 'discussions': void router.navigate(['/discussions', hit.id], extras); break;
    case 'resources': if (hit.url) window.open(hit.url, '_blank', 'noopener,noreferrer'); break;
  }
}

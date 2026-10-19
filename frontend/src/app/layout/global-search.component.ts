import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { LocalizePipe, TranslatePipe } from '../core/i18n/pipes';
import { SearchCategory, SearchHit, SearchResult } from '../core/models';
import { IconComponent } from '../shared/icon.component';

const ICONS: Record<SearchCategory, string> = {
  topics: 'book', projects: 'folder', tasks: 'check-circle', practice: 'code', interview: 'chat', resources: 'link', notes: 'note',
};

/** Search-as-you-type in the top bar. Press "/" anywhere to focus it. */
@Component({
  selector: 'app-global-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe],
  template: `
    <div class="global-search" [class.open]="open()">
      <app-icon name="search" [size]="16" class="search-icon" />
      <input #input type="search" role="combobox" aria-autocomplete="list" aria-controls="search-results"
             [attr.aria-expanded]="open()" [attr.aria-activedescendant]="activeId()"
             [placeholder]="'search.placeholder' | t" [attr.aria-label]="'nav.search' | t"
             [value]="query()" (input)="onInput($any($event.target).value)"
             (keydown)="onKeydown($event)" (focus)="open.set(query().length >= 2)" />
      <kbd class="search-kbd" aria-hidden="true">/</kbd>

      @if (open()) {
        <div class="search-panel" id="search-results" role="listbox">
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
        </div>
      }
    </div>
  `,
})
export class GlobalSearchComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal('');
  protected readonly result = signal<SearchResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private requestId = 0;

  protected readonly flat = computed(() =>
    (this.result()?.groups ?? []).flatMap(g => g.items.map(hit => ({ category: g.category, hit }))));
  protected readonly activeId = computed(() => {
    const item = this.flat()[this.active()];
    return item ? `sr-${item.category}-${item.hit.id}` : null;
  });

  protected icon(category: SearchCategory): string { return ICONS[category]; }

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
    else if (event.key === 'Escape') { this.open.set(false); }
    else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.flat()[this.active()];
      if (item) this.go(item.category, item.hit); else this.viewAll();
    }
  }

  protected go(category: SearchCategory, hit: SearchHit): void {
    this.open.set(false);
    navigateToHit(this.router, category, hit);
  }

  protected viewAll(): void {
    if (this.query().trim().length < 2) return;
    this.open.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: this.query().trim() } });
  }

  @HostListener('document:keydown', ['$event'])
  protected onGlobalKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
    if (event.key === '/' && !typing) { event.preventDefault(); this.input().nativeElement.focus(); }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}

/** Shared by the dropdown and the full search page. */
export function navigateToHit(router: Router, category: SearchCategory, hit: SearchHit): void {
  switch (category) {
    case 'topics': void router.navigate(['/topics', hit.id]); break;
    case 'projects': void router.navigate(['/projects', hit.id]); break;
    case 'tasks': void router.navigate(['/projects', hit.parentId], { fragment: `task-${hit.id}` }); break;
    case 'practice': void router.navigate(['/practice', hit.id]); break;
    case 'interview': void router.navigate(['/interviews'], { queryParams: { question: hit.id } }); break;
    case 'notes': void router.navigate(['/notes'], { queryParams: { id: hit.id } }); break;
    case 'resources': if (hit.url) window.open(hit.url, '_blank', 'noopener,noreferrer'); break;
  }
}

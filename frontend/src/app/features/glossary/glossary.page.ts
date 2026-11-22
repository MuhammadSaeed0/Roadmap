import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { GlossaryTerm } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

type Order = 'en' | 'ar';

/** Arabic sort key: the article «ال» is ignored and hamza forms of alif count as alif, as in printed dictionaries. */
export function arabicKey(value: string): string {
  return value.trim().replace(/^ال/, '').replace(/[أإآ]/g, 'ا');
}

/** Search across both languages, ignoring case and Arabic hamza differences. */
export function matches(term: GlossaryTerm, query: string): boolean {
  const q = arabicKey(query.trim().toLowerCase());
  if (!q) return true;
  return [term.term, term.arabic, term.shortEn, term.shortAr].some(text => arabicKey(text.toLowerCase()).includes(q));
}

/**
 * The bilingual glossary: every term the lessons use, in English and Arabic, with a one-line definition and the
 * topic that explains it. Searchable, and listed A-Z or in Arabic alphabetical order (?q= and ?order= keep the view).
 */
@Component({
  selector: 'app-glossary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'glossary.title' | t" [subtitle]="'glossary.subtitle' | t" />

    <div class="toolbar gl-toolbar" data-tour="glossary-search">
      <div class="field grow">
        <label for="gl-q" class="sr-only">{{ 'glossary.search' | t }}</label>
        <div class="input-icon">
          <app-icon name="search" [size]="16" />
          <input id="gl-q" type="search" class="input input-sm" [value]="query()" [placeholder]="'glossary.search' | t"
                 (input)="setQuery($any($event.target).value)" />
        </div>
      </div>
      <div class="segmented" role="radiogroup" [attr.aria-label]="'glossary.order' | t">
        <button type="button" role="radio" [attr.aria-checked]="order() === 'en'" [class.active]="order() === 'en'" (click)="setOrder('en')">A–Z</button>
        <button type="button" role="radio" [attr.aria-checked]="order() === 'ar'" [class.active]="order() === 'ar'" (click)="setOrder('ar')">أ–ي</button>
      </div>
    </div>

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="8" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else {
      <p class="small muted" aria-live="polite">{{ 'glossary.count' | t: { n: visible().length } }}</p>
      @if (groups().length === 0) {
        <app-empty-state icon="search" [title]="'glossary.empty' | t" />
      } @else {
        <nav class="gl-letters" [attr.aria-label]="'glossary.letters' | t">
          @for (g of groups(); track g.letter) { <a [href]="'#gl-' + g.id" (click)="jump($event, g.id)">{{ g.letter }}</a> }
        </nav>
        <div class="gl-groups" data-tour="glossary-list">
          @for (g of groups(); track g.letter) {
            <section class="card gl-group" [id]="'gl-' + g.id" [attr.aria-labelledby]="'gl-h-' + g.id">
              <h2 class="gl-letter" [id]="'gl-h-' + g.id">{{ g.letter }}</h2>
              <dl class="gl-list">
                @for (t of g.terms; track t.term) {
                  <div class="gl-item">
                    <dt>
                      <bdi dir="ltr" class="gl-term">{{ t.term }}</bdi>
                      <span class="gl-arabic" lang="ar" dir="rtl">{{ t.arabic }}</span>
                    </dt>
                    <dd>
                      <p>{{ i18n.pick(t.shortEn, t.shortAr) }}</p>
                      <a class="gl-topic small" [routerLink]="['/topics', t.topicId]">
                        <app-icon name="book" [size]="13" /> {{ 'glossary.learnIt' | t }}: {{ i18n.pick(t.topicTitleEn, t.topicTitleAr) }}
                      </a>
                    </dd>
                  </div>
                }
              </dl>
            </section>
          }
        </div>
      }
    }
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .gl-toolbar { align-items: center; }
    .gl-letters { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 16px; }
    .gl-letters a {
      min-width: 32px; height: 32px; display: inline-grid; place-items: center; padding: 0 6px;
      border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); font-weight: 600;
    }
    .gl-letters a:hover { border-color: var(--accent); text-decoration: none; }
    .gl-groups { display: grid; gap: 16px; }
    .gl-group { margin: 0; scroll-margin-top: 88px; }
    .gl-letter { font-size: 1.4rem; margin: 0 0 8px; color: var(--accent); }
    .gl-list { margin: 0; display: grid; gap: 0; }
    .gl-item { padding: 12px 0; border-top: 1px solid var(--border); display: grid; grid-template-columns: minmax(180px, 1fr) 2fr; gap: 4px 16px; }
    .gl-item:first-child { border-top: 0; }
    .gl-item dt { display: flex; flex-direction: column; gap: 2px; }
    .gl-term { font-weight: 600; font-family: var(--font-mono, inherit); }
    .gl-arabic { color: var(--text-2); }
    .gl-item dd { margin: 0; }
    .gl-item dd p { margin: 0 0 4px; line-height: 1.7; }
    .gl-topic { display: inline-flex; align-items: center; gap: 4px; }
    @container (max-width: 640px) { .gl-item { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export default class GlossaryPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly data = createLoader(() => this.api.glossary());
  protected readonly query = signal(this.params.get('q') ?? '');
  /** Arabic order by default for Arabic readers; the choice is kept in ?order=. */
  protected readonly order = signal<Order>((this.params.get('order') as Order | null) ?? (this.i18n.lang() === 'ar' ? 'ar' : 'en'));

  protected readonly visible = computed(() => (this.data.value() ?? []).filter(t => matches(t, this.query())));

  /** Terms grouped by first letter, in the chosen alphabet. */
  protected readonly groups = computed(() => {
    const byArabic = this.order() === 'ar';
    const key = (t: GlossaryTerm) => (byArabic ? arabicKey(t.arabic) : t.term.toLowerCase());
    const sorted = [...this.visible()].sort((a, b) => key(a).localeCompare(key(b), byArabic ? 'ar' : 'en'));
    const groups: { letter: string; id: string; terms: GlossaryTerm[] }[] = [];
    for (const t of sorted) {
      const first = key(t).charAt(0);
      const letter = byArabic ? first : /[a-z]/.test(first) ? first.toUpperCase() : '#';
      const last = groups[groups.length - 1];
      if (last?.letter === letter) last.terms.push(t);
      else groups.push({ letter, id: `${byArabic ? 'ar' : 'en'}-${groups.length}`, terms: [t] });
    }
    return groups;
  });

  protected setQuery(value: string): void {
    this.query.set(value);
    this.syncUrl();
  }

  protected setOrder(order: Order): void {
    this.order.set(order);
    this.syncUrl();
  }

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById('gl-' + id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  private syncUrl(): void {
    void this.router.navigate([], { queryParams: { q: this.query() || null, order: this.order() }, replaceUrl: true });
  }
}

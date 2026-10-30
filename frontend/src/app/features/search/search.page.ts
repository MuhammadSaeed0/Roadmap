import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { SearchCategory, SearchHit } from '../../core/models';
import { navigateToHit } from '../../layout/global-search.component';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'search.resultsFor' | t: { q: query() }" />
    @if (query().length < 2) {
      <app-empty-state icon="search" [title]="'search.minChars' | t" />
    } @else if (data.initialLoading() || data.loading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as r) {
      @if (r.groups.length === 0) {
        <app-empty-state icon="search" [title]="'search.noResults' | t: { q: query() }" />
      } @else {
        <div class="grid grid-2" data-tour="search-results">
          @for (g of r.groups; track g.category) {
            <section class="card" [attr.aria-labelledby]="'sg-' + g.category">
              <h2 class="card-title" [id]="'sg-' + g.category">{{ 'search.categories.' + g.category | t }} <span class="muted small">{{ g.items.length }}</span></h2>
              <ul class="link-list" role="list">
                @for (hit of g.items; track hit.id) {
                  <li>
                    <button type="button" class="link-btn" (click)="go(g.category, hit)">{{ hit | loc: 'title' }}
                      @if (g.category === 'resources') { <app-icon name="external" [size]="12" /> }
                    </button>
                    @if (hit.subtitleEn) { <span class="tiny muted">{{ hit | loc: 'subtitle' }}</span> }
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      }
    }
  `,
})
export default class SearchPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  /** ?q= query parameter, bound as an input by the router. */
  readonly q = input<string>('');
  protected readonly query = computed(() => (this.q() ?? '').trim());
  protected readonly data = createLoader(() => this.api.search(this.query()), { immediate: false });

  constructor() {
    effect(() => {
      if (this.query().length >= 2) untracked(() => void this.data.reload());
    });
  }

  protected go(category: SearchCategory, hit: SearchHit): void { navigateToHit(this.router, category, hit); }
}

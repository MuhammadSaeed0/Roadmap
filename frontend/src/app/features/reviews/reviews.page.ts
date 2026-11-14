import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ReviewRequest } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { ReviewScaleComponent } from './review-scale.component';

type Tab = 'open' | 'reviewing' | 'requested';

/** Peer reviews: requests I can take, reviews I'm doing, and the reviews I asked for. */
@Component({
  selector: 'app-reviews-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe, PageHeaderComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent, ReviewScaleComponent],
  styles: `
    .list { display: flex; flex-direction: column; gap: 12px; list-style: none; margin: 0; padding: 0; }
    .list .card { margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .meta { margin: 0; }
  `,
  template: `
    <app-page-header [title]="'reviews.title' | t" [subtitle]="'reviews.subtitle' | t" />

    <div class="tabs" role="tablist" data-tour="reviews-tabs" [attr.aria-label]="'reviews.title' | t">
      @for (t of tabs; track t) {
        <button type="button" role="tab" [id]="'rv-tab-' + t" [attr.aria-selected]="tab() === t" [attr.aria-controls]="'rv-panel-' + t"
                [class.active]="tab() === t" (click)="setTab(t)">
          {{ 'reviews.tabs.' + t | t }} @if (count(t); as n) { <span class="chip-count">{{ n }}</span> }
        </button>
      }
    </div>

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="5" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as d) {
      <div role="tabpanel" [id]="'rv-panel-' + tab()" [attr.aria-labelledby]="'rv-tab-' + tab()" data-tour="reviews-list">
        @if (items().length === 0) {
          <app-empty-state icon="check-circle" [title]="'reviews.empty.' + tab() | t" [message]="'reviews.emptyHint.' + tab() | t">
            @if (tab() === 'requested') { <a routerLink="/projects" class="btn btn-secondary btn-sm">{{ 'nav.projects' | t }}</a> }
          </app-empty-state>
        } @else {
          <ul class="list" role="list">
            @for (r of items(); track r.id) {
              <li>
                <article class="card">
                  <div class="row-between">
                    <h2 class="section-title meta"><app-icon name="folder" /> {{ i18n.pick(r.projectTitleEn, r.projectTitleAr) }}</h2>
                    <span class="badge" [attr.data-status]="r.status === 'Completed' ? 'Completed' : r.status === 'Claimed' ? 'InProgress' : null">{{ 'reviews.status.' + r.status | t }}</span>
                  </div>
                  <p class="row-gap tiny muted meta">
                    <span>{{ 'reviews.by' | t: { name: r.requesterName } }}</span>
                    <span>{{ r.createdAt | fmtDate }}</span>
                    @if (r.reviewerName && !r.isReviewer) { <span>{{ 'reviews.reviewer' | t: { name: r.reviewerName } }}</span> }
                  </p>
                  <a class="small" [href]="r.repositoryUrl" target="_blank" rel="noopener noreferrer nofollow" dir="ltr">
                    <app-icon name="external" [size]="13" /> {{ r.repositoryUrl }}</a>

                  @if (r.isReviewer && r.status === 'Claimed') {
                    <p class="small muted meta">{{ 'reviews.howTo' | t }}</p>
                    <app-review-scale [criteria]="d.criteria" [scores]="draft(r.id)" [idPrefix]="'rv' + r.id + '-'" (changed)="setScore(r.id, $event)" />
                    <div class="field">
                      <label [for]="'rv-notes-' + r.id">{{ 'devLevel.review.notes' | t }}</label>
                      <textarea class="input" rows="3" maxlength="4000" dir="auto" [id]="'rv-notes-' + r.id" #notes></textarea>
                    </div>
                    <div class="row-gap">
                      <button type="button" class="btn btn-primary btn-sm" [disabled]="busy() || !complete(r.id, d.criteria)" (click)="submit(r, notes.value)">{{ 'reviews.submit' | t }}</button>
                      <button type="button" class="btn btn-ghost btn-sm" [disabled]="busy()" (click)="release(r)">{{ 'reviews.release' | t }}</button>
                    </div>
                  } @else if (r.status === 'Completed' && r.scores) {
                    <app-review-scale [criteria]="d.criteria" [scores]="r.scores" [readonly]="true" [idPrefix]="'rv' + r.id + '-'" />
                    @if (r.notes) { <p class="small meta" dir="auto">{{ r.notes }}</p> }
                  }

                  @if (tab() === 'open') {
                    <div><button type="button" class="btn btn-primary btn-sm" [disabled]="busy()" (click)="claim(r)">{{ 'reviews.claim' | t }}</button></div>
                  }
                  @if (r.isMine && (r.status === 'Open' || r.status === 'Claimed')) {
                    <div><button type="button" class="btn btn-ghost btn-sm btn-danger-text" [disabled]="busy()" (click)="cancel(r)">{{ 'reviews.cancel' | t }}</button></div>
                  }
                </article>
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export default class ReviewsPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly i18n = inject(I18nService);

  protected readonly tabs: Tab[] = ['open', 'reviewing', 'requested'];
  protected readonly tab = signal<Tab>('open');
  protected readonly busy = signal(false);
  private readonly drafts = signal<Record<number, Record<string, number>>>({});

  protected readonly data = createLoader(() => this.api.reviewRequests());
  protected readonly items = computed(() => {
    const d = this.data.value();
    return !d ? [] : this.tab() === 'open' ? d.open : this.tab() === 'reviewing' ? d.reviewing : d.requested;
  });

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(q => {
      const t = q.get('tab') as Tab;
      this.tab.set(this.tabs.includes(t) ? t : 'open');
    });
  }

  protected setTab(tab: Tab): void {
    void this.router.navigate([], { queryParams: { tab: tab === 'open' ? null : tab }, replaceUrl: true });
  }

  protected count(tab: Tab): number {
    const d = this.data.value();
    if (!d) return 0;
    return tab === 'open' ? d.open.length : tab === 'reviewing' ? d.reviewing.filter(r => r.status === 'Claimed').length : 0;
  }

  protected draft(id: number): Record<string, number> { return this.drafts()[id] ?? {}; }
  protected complete(id: number, criteria: string[]): boolean { return criteria.every(c => this.draft(id)[c] !== undefined); }
  protected setScore(id: number, e: { criterion: string; value: number }): void {
    this.drafts.update(d => ({ ...d, [id]: { ...(d[id] ?? {}), [e.criterion]: e.value } }));
  }

  private async run(work: () => Promise<unknown>, done?: string): Promise<void> {
    this.busy.set(true);
    try {
      await work();
      if (done) this.toast.success(this.i18n.t(done));
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(false);
    }
  }

  protected claim(r: ReviewRequest) {
    return this.run(async () => { await this.api.claimReview(r.id); this.setTab('reviewing'); }, 'reviews.claimed');
  }
  protected release(r: ReviewRequest) { return this.run(() => this.api.releaseReview(r.id)); }
  protected submit(r: ReviewRequest, notes: string) {
    return this.run(() => this.api.submitReview(r.id, { scores: this.draft(r.id), notes: notes.trim() || null }), 'reviews.submitted');
  }
  protected async cancel(r: ReviewRequest) {
    if (!(await this.confirm.ask({ message: this.i18n.t('reviews.cancelConfirm'), danger: true }))) return;
    await this.run(() => this.api.cancelReview(r.id));
  }
}

import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ReviewRequest } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ReviewScaleComponent } from './review-scale.component';

/** On a project page: ask another learner to review the finished project, and see their review. */
@Component({
  selector: 'app-peer-review-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, ReviewScaleComponent],
  template: `
    <section class="card stack" aria-labelledby="peer-h">
      <h2 id="peer-h" class="card-title"><app-icon name="user" /> {{ 'reviews.cardTitle' | t }}</h2>
      @if (request(); as r) {
        @switch (r.status) {
          @case ('Open') { <p class="small">{{ 'reviews.waiting' | t }}</p> }
          @case ('Claimed') { <p class="small">{{ 'reviews.inReview' | t: { name: r.reviewerName ?? '' } }}</p> }
          @case ('Completed') {
            <p class="small">{{ 'reviews.done' | t: { name: r.reviewerName ?? ('discussions.deleted' | t) } }}</p>
            @if (r.scores && criteria().length) { <app-review-scale [criteria]="criteria()" [scores]="r.scores" [readonly]="true" idPrefix="peer-" /> }
            @if (r.notes) { <p class="small" dir="auto">{{ r.notes }}</p> }
          }
        }
      } @else {
        <p class="small muted">{{ 'reviews.cardIntro' | t }}</p>
        @if (!finished()) { <p class="tiny muted">{{ 'reviews.needFinished' | t }}</p> }
        @else if (!hasRepository()) { <p class="tiny muted">{{ 'reviews.needRepository' | t }}</p> }
      }
      <div class="row-gap">
        @if (!request() || request()!.status === 'Completed') {
          <button type="button" class="btn btn-secondary btn-sm" [disabled]="busy() || !finished() || !hasRepository()" (click)="ask()">
            {{ (request() ? 'reviews.askAgain' : 'reviews.ask') | t }}</button>
        }
        <a class="btn btn-ghost btn-sm" routerLink="/reviews">{{ 'reviews.title' | t }}</a>
      </div>
    </section>
  `,
})
export class PeerReviewCardComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly projectId = input.required<number>();
  readonly finished = input(false);
  readonly hasRepository = input(false);

  protected readonly request = signal<ReviewRequest | null>(null);
  protected readonly criteria = signal<string[]>([]);
  protected readonly busy = signal(false);

  constructor() {
    effect(() => {
      const id = this.projectId();
      untracked(() => void this.load(id));
    });
  }

  private async load(id: number): Promise<void> {
    try {
      const [r, lists] = await Promise.all([this.api.projectReviewRequest(id), this.api.reviewRequests()]);
      this.request.set(r ?? null);
      this.criteria.set(lists.criteria);
    } catch { /* the card stays in its empty state */ }
  }

  protected async ask(): Promise<void> {
    this.busy.set(true);
    try {
      this.request.set(await this.api.requestReview(this.projectId()));
      this.toast.success(this.i18n.t('reviews.asked'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(false);
    }
  }
}

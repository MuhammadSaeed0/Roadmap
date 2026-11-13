import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-topic-discussions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe, SkeletonComponent, ErrorStateComponent],
  template: `
    <section class="card">
      <h2 class="section-title"><app-icon name="message-square" /> {{ 'discussions.title' | t }}</h2>
      @if (data.initialLoading()) {
        <app-skeleton [rows]="2" [height]="20" />
      } @else if (data.error()) {
        <app-error-state [error]="data.error()" (retry)="data.reload()" />
      } @else {
        @if (items().length === 0) {
          <p class="muted">{{ 'discussions.noDiscussions' | t }} {{ 'discussions.beFirst' | t }}</p>
        } @else {
          <ul class="link-list" role="list">
            @for (d of items(); track d.id) {
              <li>
                <a [routerLink]="['/discussions', d.id]" dir="auto">{{ i18n.pick(d.titleEn, d.titleAr) }}</a>
                <span class="muted small">
                  · {{ 'discussions.replies' | t:{ n: d.replyCount } }} · {{ d.createdAt | fmtDate }}
                  @if (d.hasAcceptedReply) { · {{ 'discussions.accepted' | t }} }
                </span>
              </li>
            }
          </ul>
        }
        <div class="row-gap section-gap">
          <a routerLink="/discussions" [queryParams]="{ topicId: topicId(), ask: 1 }" class="btn btn-secondary btn-sm">
            <app-icon name="plus" [size]="14" /> {{ 'discussions.ask' | t }}
          </a>
          @if (items().length > 0) {
            <a routerLink="/discussions" [queryParams]="{ topicId: topicId() }" class="btn btn-ghost btn-sm">{{ 'common.viewAll' | t }}</a>
          }
        </div>
      }
    </section>
  `,
})
export class TopicDiscussionsComponent {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);

  readonly topicId = input.required<number>();
  // Required inputs are only readable after construction, so the first load waits for the effect.
  protected readonly data = createLoader(() => this.api.discussions({ topicId: this.topicId(), sort: 'votes' }), { immediate: false });
  protected readonly items = computed(() => (this.data.value()?.items ?? []).slice(0, 5));

  constructor() {
    effect(() => {
      this.topicId();
      untracked(() => void this.data.reload());
    });
  }
}

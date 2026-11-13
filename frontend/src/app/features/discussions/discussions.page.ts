import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-discussions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './discussions.css',
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe,
    PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'discussions.title' | t">
      <button type="button" class="btn btn-primary btn-sm" (click)="showForm.set(!showForm())">
        <app-icon name="plus" [size]="15" /> {{ 'discussions.ask' | t }}
      </button>
    </app-page-header>

    @if (showForm()) {
      <section class="card discussion-form" data-tour="discussions-ask" [attr.aria-label]="'discussions.ask' | t">
        <div class="field">
          <label for="ask-topic">{{ 'discussions.topicLabel' | t }}</label>
          <select id="ask-topic" class="input" (change)="askTopic.set(+$any($event.target).value)">
            <option value="0" [selected]="!askTopic()">{{ 'quickAdd.chooseTopic' | t }}</option>
            @for (t of topics(); track t.id) {
              <option [value]="t.id" [selected]="askTopic() === t.id">{{ i18n.pick(t.titleEn, t.titleAr) }}</option>
            }
          </select>
        </div>
        <div class="field">
          <label for="ask-title">{{ 'discussions.titleLabel' | t }}</label>
          <input id="ask-title" class="input" maxlength="200" #titleIn />
        </div>
        <div class="field">
          <label for="ask-body">{{ 'discussions.bodyLabel' | t }}</label>
          <textarea id="ask-body" class="input" rows="5" maxlength="4000" #bodyIn></textarea>
        </div>
        <div class="row-end">
          <button type="button" class="btn btn-ghost" (click)="showForm.set(false)">{{ 'common.cancel' | t }}</button>
          <button type="button" class="btn btn-primary" [disabled]="posting() || !askTopic()" (click)="submit(titleIn.value, bodyIn.value)">
            {{ (posting() ? 'common.saving' : 'discussions.ask') | t }}
          </button>
        </div>
      </section>
    }

    <section class="card filter-bar" data-tour="discussions-filters" [attr.aria-label]="'common.filters' | t">
      <div class="field grow">
        <label for="disc-topic" class="sr-only">{{ 'discussions.topicLabel' | t }}</label>
        <select id="disc-topic" class="input" (change)="setTopic($any($event.target).value)">
          <option value="" [selected]="topicId() === null">{{ 'discussions.allTopics' | t }}</option>
          @for (t of topics(); track t.id) {
            <option [value]="t.id" [selected]="topicId() === t.id">{{ i18n.pick(t.titleEn, t.titleAr) }}</option>
          }
        </select>
      </div>
      <div class="segmented" role="group" [attr.aria-label]="'discussions.sortNewest' | t">
        <button type="button" [class.active]="sort() === 'newest'" [attr.aria-pressed]="sort() === 'newest'" (click)="setSort('newest')">{{ 'discussions.sortNewest' | t }}</button>
        <button type="button" [class.active]="sort() === 'votes'" [attr.aria-pressed]="sort() === 'votes'" (click)="setSort('votes')">{{ 'discussions.sortVotes' | t }}</button>
      </div>
    </section>

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" [height]="28" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (discussions().length === 0) {
      <app-empty-state icon="message-square" [title]="'discussions.noDiscussions' | t" [message]="'discussions.beFirst' | t" />
    } @else {
      <ul class="discussion-list" data-tour="discussions-list" role="list" [class.is-loading]="data.loading()">
        @for (d of discussions(); track d.id) {
          <li>
            <a [routerLink]="['/discussions', d.id]" class="card discussion-item">
              <div class="discussion-stats">
                <span class="discussion-score" dir="ltr">{{ d.score }}</span>
                <span class="tiny muted">{{ 'discussions.votes' | t }}</span>
              </div>
              <div class="discussion-main">
                <h3 class="discussion-title" dir="auto">
                  @if (d.isPinned) { <app-icon name="pin" [size]="14" /> }
                  {{ i18n.pick(d.titleEn, d.titleAr) }}
                </h3>
                <p class="discussion-excerpt muted small" dir="auto">{{ i18n.pick(d.bodyEn, d.bodyAr) }}</p>
                <p class="row-gap tiny muted">
                  <span class="chip chip-sm">{{ i18n.pick(d.topicTitleEn, d.topicTitleAr) }}</span>
                  <span>{{ d.authorName ?? ('discussions.deleted' | t) }}</span>
                  <span>{{ d.createdAt | fmtDate }}</span>
                  <span class="discussion-replies" [class.is-answered]="d.hasAcceptedReply">
                    @if (d.hasAcceptedReply) { <app-icon name="check" [size]="12" /> }
                    {{ 'discussions.replies' | t:{ n: d.replyCount } }}
                  </span>
                </p>
              </div>
            </a>
          </li>
        }
      </ul>
      @if (totalPages() > 1) {
        <nav class="row-between section-gap" [attr.aria-label]="'common.page' | t:{ page: page(), pages: totalPages() }">
          <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() <= 1" (click)="goPage(page() - 1)">{{ 'common.previous' | t }}</button>
          <span class="small muted">{{ 'common.page' | t:{ page: page(), pages: totalPages() } }}</span>
          <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() >= totalPages()" (click)="goPage(page() + 1)">{{ 'common.next' | t }}</button>
        </nav>
      }
    }
  `,
})
export default class DiscussionsPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly topicId = signal<number | null>(Number(this.route.snapshot.queryParamMap.get('topicId')) || null);
  protected readonly sort = signal<'newest' | 'votes'>('newest');
  protected readonly page = signal(1);
  /** Opening from a topic page ("Ask a question" there) starts with the form open for that topic. */
  protected readonly showForm = signal(this.route.snapshot.queryParamMap.has('ask'));
  protected readonly posting = signal(false);
  protected readonly askTopic = signal(this.topicId() ?? 0);
  private readonly pageSize = 20;

  private readonly roadmap = createLoader(() => this.api.roadmap());
  protected readonly topics = computed(() => this.roadmap.value()?.phases.flatMap(p => p.topics) ?? []);

  protected readonly data = createLoader(() => this.api.discussions({ topicId: this.topicId(), sort: this.sort(), page: this.page() }));
  protected readonly discussions = computed(() => this.data.value()?.items ?? []);
  protected readonly totalPages = computed(() => Math.ceil((this.data.value()?.total ?? 0) / this.pageSize));

  protected setTopic(value: string) {
    this.topicId.set(value ? Number(value) : null);
    if (value) this.askTopic.set(Number(value));
    this.page.set(1);
    void this.data.reload();
  }

  protected setSort(sort: 'newest' | 'votes') {
    this.sort.set(sort);
    this.page.set(1);
    void this.data.reload();
  }

  protected goPage(p: number) {
    this.page.set(p);
    void this.data.reload();
  }

  protected async submit(title: string, body: string) {
    if (!title.trim() || !body.trim()) {
      this.toast.error(this.i18n.t('errors.codes.required'));
      return;
    }
    this.posting.set(true);
    try {
      const d = await this.api.createDiscussion({ topicId: this.askTopic(), titleEn: title, titleAr: title, bodyEn: body, bodyAr: body });
      void this.router.navigate(['/discussions', d.id]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.posting.set(false);
    }
  }
}

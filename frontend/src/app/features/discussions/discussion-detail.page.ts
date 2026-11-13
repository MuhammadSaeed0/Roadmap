import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ReplyDto } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { DiscussionTextComponent } from './discussion-text.component';

@Component({
  selector: 'app-discussion-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './discussions.css',
  imports: [RouterLink, IconComponent, DiscussionTextComponent, TranslatePipe, FormatDatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="8" [height]="24" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as d) {
      <app-page-header [title]="'discussions.title' | t">
        <a routerLink="/discussions" class="btn btn-ghost btn-sm"><app-icon name="arrow-left" [size]="15" /> {{ 'discussions.title' | t }}</a>
      </app-page-header>

      <article class="card discussion-post" data-tour="discussion-post">
        <div class="vote" role="group" [attr.aria-label]="'discussions.votes' | t">
          <button type="button" class="icon-btn" [class.is-on]="d.myVote === 1" [attr.aria-pressed]="d.myVote === 1"
                  [attr.aria-label]="'discussions.upvote' | t" [disabled]="voting()" (click)="vote(1)"><app-icon name="chevron-up" [size]="20" /></button>
          <span class="vote-score" dir="ltr">{{ d.score }}</span>
          <button type="button" class="icon-btn" [class.is-on]="d.myVote === -1" [attr.aria-pressed]="d.myVote === -1"
                  [attr.aria-label]="'discussions.downvote' | t" [disabled]="voting()" (click)="vote(-1)"><app-icon name="chevron-down" [size]="20" /></button>
        </div>
        <div class="discussion-main">
          @if (editing() === 'question') {
            <div class="field">
              <label for="edit-title">{{ 'discussions.titleLabel' | t }}</label>
              <input id="edit-title" class="input" maxlength="200" dir="auto" [value]="i18n.pick(d.titleEn, d.titleAr)" #editTitle />
            </div>
            <div class="field">
              <label for="edit-body">{{ 'discussions.bodyLabel' | t }}</label>
              <textarea id="edit-body" class="input" rows="6" maxlength="4000" dir="auto" [value]="i18n.pick(d.bodyEn, d.bodyAr)" #editBody></textarea>
              <span class="tiny muted">{{ 'discussions.codeHint' | t }}</span>
            </div>
            <div class="row-gap">
              <button type="button" class="btn btn-primary btn-sm" [disabled]="saving()" (click)="saveQuestion(editTitle.value, editBody.value)">{{ 'common.save' | t }}</button>
              <button type="button" class="btn btn-ghost btn-sm" (click)="editing.set(null)">{{ 'common.cancel' | t }}</button>
            </div>
          } @else {
            <h2 class="discussion-heading" dir="auto">{{ i18n.pick(d.titleEn, d.titleAr) }}</h2>
            <p class="row-gap tiny muted">
              <a class="chip chip-sm chip-link" [routerLink]="['/topics', d.topicId]">{{ i18n.pick(d.topicTitleEn, d.topicTitleAr) }}</a>
              <span>{{ d.authorName ?? ('discussions.deleted' | t) }}</span>
              <span>{{ d.createdAt | fmtDate }}</span>
              @if (d.updatedAt > d.createdAt) { <span>{{ 'discussions.edited' | t }}</span> }
              @if (d.isPinned) { <span class="badge"><app-icon name="pin" [size]="12" /> {{ 'discussions.pinned' | t }}</span> }
            </p>
            <app-discussion-text [text]="i18n.pick(d.bodyEn, d.bodyAr)" />
            @if (isAuthor() || auth.isAdmin()) {
              <div class="row-gap">
                @if (isAuthor()) {
                  <button type="button" class="btn btn-ghost btn-xs" (click)="editing.set('question')"><app-icon name="edit" [size]="13" /> {{ 'common.edit' | t }}</button>
                }
                @if (auth.isAdmin()) {
                  <button type="button" class="btn btn-ghost btn-xs" (click)="togglePin()"><app-icon name="pin" [size]="13" /> {{ (d.isPinned ? 'discussions.unpin' : 'discussions.pin') | t }}</button>
                }
                <button type="button" class="btn btn-ghost btn-xs btn-danger-text" (click)="deleteDiscussion()"><app-icon name="trash" [size]="13" /> {{ 'common.delete' | t }}</button>
              </div>
            }
          }
        </div>
      </article>

      <h2 class="section-title section-gap"><app-icon name="message-square" /> {{ 'discussions.replies' | t:{ n: d.replies.length } }}</h2>
      @for (r of d.replies; track r.id) {
        <article class="card discussion-post" [class.is-accepted]="r.isAccepted">
          <div class="vote" role="group" [attr.aria-label]="'discussions.votes' | t">
            <button type="button" class="icon-btn" [class.is-on]="r.myVote === 1" [attr.aria-pressed]="r.myVote === 1"
                    [attr.aria-label]="'discussions.upvote' | t" [disabled]="voting()" (click)="voteReply(r, 1)"><app-icon name="chevron-up" [size]="18" /></button>
            <span class="vote-score" dir="ltr">{{ r.score }}</span>
            <button type="button" class="icon-btn" [class.is-on]="r.myVote === -1" [attr.aria-pressed]="r.myVote === -1"
                    [attr.aria-label]="'discussions.downvote' | t" [disabled]="voting()" (click)="voteReply(r, -1)"><app-icon name="chevron-down" [size]="18" /></button>
          </div>
          <div class="discussion-main">
            <p class="row-gap tiny muted">
              @if (r.isAccepted) { <span class="badge badge-success"><app-icon name="check" [size]="12" /> {{ 'discussions.accepted' | t }}</span> }
              <span>{{ r.authorName ?? ('discussions.deleted' | t) }}</span>
              <span>{{ r.createdAt | fmtDate }}</span>
            </p>
            @if (editing() === r.id) {
              <textarea class="input" rows="5" maxlength="4000" dir="auto" [attr.aria-label]="'discussions.editReply' | t" [value]="i18n.pick(r.bodyEn, r.bodyAr)" #editReply></textarea>
              <div class="row-gap">
                <button type="button" class="btn btn-primary btn-sm" [disabled]="saving()" (click)="saveReply(r.id, editReply.value)">{{ 'common.save' | t }}</button>
                <button type="button" class="btn btn-ghost btn-sm" (click)="editing.set(null)">{{ 'common.cancel' | t }}</button>
              </div>
            } @else {
              <app-discussion-text [text]="i18n.pick(r.bodyEn, r.bodyAr)" />
              <div class="row-gap">
                @if (isAuthor() && !d.acceptedReplyId && r.authorId !== d.authorId) {
                  <button type="button" class="btn btn-secondary btn-xs" (click)="accept(r.id)"><app-icon name="check" [size]="13" /> {{ 'discussions.accept' | t }}</button>
                }
                @if (r.authorId === auth.account()?.id) {
                  <button type="button" class="btn btn-ghost btn-xs" (click)="editing.set(r.id)"><app-icon name="edit" [size]="13" /> {{ 'common.edit' | t }}</button>
                }
                @if (r.authorId === auth.account()?.id || auth.isAdmin()) {
                  <button type="button" class="btn btn-ghost btn-xs btn-danger-text" (click)="deleteReply(r.id)"><app-icon name="trash" [size]="13" /> {{ 'common.delete' | t }}</button>
                }
              </div>
            }
          </div>
        </article>
      } @empty {
        <p class="muted">{{ 'discussions.noReplies' | t }}</p>
      }

      <section class="card section-gap" data-tour="discussion-reply" [attr.aria-label]="'discussions.reply' | t">
        <div class="field">
          <label for="reply-body">{{ 'discussions.yourReply' | t }}</label>
          <textarea id="reply-body" class="input" rows="4" maxlength="4000" dir="auto" #replyIn></textarea>
          <span class="tiny muted">{{ 'discussions.codeHint' | t }}</span>
        </div>
        <div class="row-end">
          <button type="button" class="btn btn-primary" [disabled]="replying()" (click)="submitReply(replyIn)">
            {{ (replying() ? 'common.saving' : 'discussions.reply') | t }}
          </button>
        </div>
      </section>
    }
  `,
})
export default class DiscussionDetailPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly data = createLoader(() => this.api.discussion(this.id));
  protected readonly replying = signal(false);
  protected readonly voting = signal(false);
  protected readonly saving = signal(false);
  /** What is being edited: the question, a reply id, or nothing. */
  protected readonly editing = signal<'question' | number | null>(null);

  protected async saveQuestion(title: string, body: string) {
    if (!title.trim() || !body.trim()) { this.toast.error(this.i18n.t('errors.codes.required')); return; }
    this.saving.set(true);
    try {
      const updated = await this.api.updateDiscussion(this.id, { titleEn: title.trim(), titleAr: title.trim(), bodyEn: body.trim(), bodyAr: body.trim() });
      this.data.set(updated);
      this.editing.set(null);
    } catch (e) { this.fail(e); } finally { this.saving.set(false); }
  }

  protected async saveReply(replyId: number, body: string) {
    if (!body.trim()) { this.toast.error(this.i18n.t('errors.codes.required')); return; }
    this.saving.set(true);
    try {
      const updated = await this.api.updateReply(this.id, replyId, { bodyEn: body.trim(), bodyAr: body.trim() });
      this.data.update(v => ({ ...v, replies: v.replies.map(x => x.id === replyId ? { ...x, bodyEn: updated.bodyEn, bodyAr: updated.bodyAr, updatedAt: updated.updatedAt } : x) }));
      this.editing.set(null);
    } catch (e) { this.fail(e); } finally { this.saving.set(false); }
  }

  protected readonly isAuthor = computed(() => {
    const d = this.data.value();
    return !!d?.authorId && d.authorId === this.auth.account()?.id;
  });

  private fail(e: unknown) {
    this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
  }

  protected async vote(value: number) {
    const d = this.data.value();
    if (!d) return;
    const next = d.myVote === value ? 0 : value;
    this.voting.set(true);
    try {
      const res = await this.api.voteDiscussion(this.id, next);
      this.data.update(v => ({ ...v, score: res.score, myVote: next || null }));
    } catch (e) { this.fail(e); } finally { this.voting.set(false); }
  }

  protected async voteReply(r: ReplyDto, value: number) {
    const next = r.myVote === value ? 0 : value;
    this.voting.set(true);
    try {
      const res = await this.api.voteReply(this.id, r.id, next);
      this.data.update(v => ({ ...v, replies: v.replies.map(x => x.id === r.id ? { ...x, score: res.score, myVote: next || null } : x) }));
    } catch (e) { this.fail(e); } finally { this.voting.set(false); }
  }

  protected async accept(replyId: number) {
    try {
      await this.api.acceptReply(this.id, replyId);
      this.data.update(v => ({ ...v, acceptedReplyId: replyId, replies: v.replies.map(x => ({ ...x, isAccepted: x.id === replyId })) }));
      this.toast.success(this.i18n.t('discussions.accepted'));
    } catch (e) { this.fail(e); }
  }

  protected async togglePin() {
    try {
      const res = await this.api.pinDiscussion(this.id);
      this.data.update(v => ({ ...v, isPinned: res.isPinned }));
    } catch (e) { this.fail(e); }
  }

  protected async deleteDiscussion() {
    if (!(await this.confirm.ask({ message: this.i18n.t('discussions.deleteConfirm'), danger: true }))) return;
    try {
      await this.api.deleteDiscussion(this.id);
      void this.router.navigate(['/discussions']);
    } catch (e) { this.fail(e); }
  }

  protected async deleteReply(replyId: number) {
    if (!(await this.confirm.ask({ message: this.i18n.t('discussions.deleteReplyConfirm'), danger: true }))) return;
    try {
      await this.api.deleteReply(this.id, replyId);
      this.data.update(v => ({ ...v, replies: v.replies.filter(x => x.id !== replyId), acceptedReplyId: v.acceptedReplyId === replyId ? null : v.acceptedReplyId }));
    } catch (e) { this.fail(e); }
  }

  protected async submitReply(textarea: HTMLTextAreaElement) {
    const body = textarea.value.trim();
    if (!body) {
      this.toast.error(this.i18n.t('errors.codes.required'));
      return;
    }
    this.replying.set(true);
    try {
      await this.api.createReply(this.id, { bodyEn: body, bodyAr: body });
      textarea.value = '';
      await this.data.reload();
    } catch (e) { this.fail(e); } finally { this.replying.set(false); }
  }
}

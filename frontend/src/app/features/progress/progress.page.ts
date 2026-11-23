import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Reason, ReviewItem, StudySession } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { QuickReviewComponent } from './quick-review.component';
import {
  ConfidencePickerComponent, EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent,
} from '../../shared/ui.components';

type Tab = 'weekly' | 'review' | 'sessions';
const TABS: Tab[] = ['weekly', 'review', 'sessions'];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-progress-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe, DurationPipe,
    PageHeaderComponent, ConfidencePickerComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent, QuickReviewComponent],
  templateUrl: './progress.page.html',
})
export default class ProgressPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly tab = signal<Tab>(TABS.find(t => t === this.route.snapshot.queryParamMap.get('tab')) ?? 'weekly');
  protected readonly tabs = TABS;

  protected readonly weekOf = signal<string | undefined>(undefined);
  protected readonly weekly = createLoader(() => this.api.weekly(this.weekOf()));
  protected readonly reviews = createLoader(() => this.api.reviews());
  protected readonly reviewing = signal<number | null>(null);
  /** The flashcard mode of the review tab (?tab=review&mode=quick). */
  protected readonly quick = signal(this.route.snapshot.queryParamMap.get('mode') === 'quick');
  protected readonly sessions = createLoader(() => this.api.sessions());
  protected readonly deleting = signal<number | null>(null);

  protected readonly dayBars = computed(() => {
    const days = this.weekly.value()?.days ?? [];
    const max = Math.max(30, ...days.map(d => d.minutes));
    return days.map(d => ({ ...d, pct: (d.minutes / max) * 100 }));
  });
  protected readonly isCurrentWeek = computed(() => !this.weekOf() || this.weekOf()! >= isoDate(new Date()));

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    this.quick.set(false);
    void this.router.navigate([], { queryParams: { tab: tab === 'weekly' ? null : tab, mode: null }, replaceUrl: true });
  }

  protected startQuick(): void {
    this.quick.set(true);
    void this.router.navigate([], { queryParams: { tab: 'review', mode: 'quick' }, replaceUrl: true });
  }

  /** Leaves the flashcards and shows the queue with the new dates. */
  protected endQuick(): void {
    this.quick.set(false);
    void this.router.navigate([], { queryParams: { tab: 'review', mode: null }, replaceUrl: true });
    void this.reviews.reload();
  }

  protected quickSaved(message: string): void { this.toast.success(message); }

  protected shiftWeek(days: number): void {
    const start = this.weekly.value()?.weekStart;
    if (!start) return;
    const d = new Date(`${start}T00:00:00`);
    d.setDate(d.getDate() + days);
    this.weekOf.set(isoDate(d));
    void this.weekly.reload();
  }

  protected weekday(date: string): string {
    return new Intl.DateTimeFormat(this.i18n.locale(), { weekday: 'short' }).format(new Date(`${date}T00:00:00`));
  }

  protected suggestionText(s: Reason): string { return this.i18n.reason('weekly.codes', s.code, s.params); }
  protected suggestionLink(s: Reason): { link: unknown[]; query?: Record<string, unknown> } | null {
    switch (s.code) {
      case 'nextTopic': return { link: ['/topics', s.params?.['topicId']] };
      case 'projectTask': return { link: ['/projects', s.params?.['projectId']] };
      case 'clearReviews': case 'reviewWeak': return { link: ['/progress'], query: { tab: 'review' } };
      case 'unblockTasks': return { link: ['/projects'] };
      case 'interviewReview': return { link: ['/interviews'], query: { mode: 'practice' } };
      default: return null;
    }
  }

  protected async completeReview(item: ReviewItem, confidence: number): Promise<void> {
    this.reviewing.set(item.topicId);
    try {
      await this.api.completeReview(item.topicId, confidence);
      this.toast.success(this.i18n.t('review.reviewed'));
      await this.reviews.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.reviewing.set(null);
    }
  }

  /** Deletes a logged study session after asking; its minutes leave the weekly totals. */
  protected async deleteSession(s: StudySession): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.t('sessions.deleteTitle'), message: this.i18n.t('sessions.deleteMessage'),
      confirmText: this.i18n.t('sessions.delete'), danger: true,
    });
    if (!ok) return;
    this.deleting.set(s.id);
    try {
      await this.api.deleteSession(s.id);
      this.sessions.update(list => list.filter(x => x.id !== s.id));
      this.toast.info(this.i18n.t('sessions.deleted'));
      void this.weekly.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.deleting.set(null);
    }
  }

  protected async addReview(topicId: number): Promise<void> {
    try {
      await this.api.addReview(topicId);
      this.toast.success(this.i18n.t('review.added'));
      await this.reviews.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected async removeReview(topicId: number): Promise<void> {
    try {
      await this.api.removeReview(topicId);
      this.toast.info(this.i18n.t('review.removed'));
      await this.reviews.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }
}

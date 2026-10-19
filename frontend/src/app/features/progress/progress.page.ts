import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Achievement, Reason, ReviewItem } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import {
  ConfidencePickerComponent, EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent,
  ProgressRingComponent, SkeletonComponent,
} from '../../shared/ui.components';

type Tab = 'overview' | 'weekly' | 'review';

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-progress-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatNumberPipe, FormatDatePipe, DurationPipe,
    PageHeaderComponent, ProgressRingComponent, ProgressBarComponent, ConfidencePickerComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent],
  templateUrl: './progress.page.html',
})
export default class ProgressPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly tab = signal<Tab>((this.route.snapshot.queryParamMap.get('tab') as Tab) ?? 'overview');
  protected readonly tabs: Tab[] = ['overview', 'weekly', 'review'];

  protected readonly report = createLoader(() => this.api.progress());
  protected readonly weekOf = signal<string | undefined>(undefined);
  protected readonly weekly = createLoader(() => this.api.weekly(this.weekOf()));
  protected readonly reviews = createLoader(() => this.api.reviews());
  protected readonly reviewing = signal<number | null>(null);

  /** Bar heights for the weekly chart, relative to the busiest week (minimum scale 60 min). */
  protected readonly weekBars = computed(() => {
    const weeks = this.report.value()?.weeklyStudy ?? [];
    const max = Math.max(60, ...weeks.map(w => w.minutes));
    return weeks.map(w => ({ ...w, pct: (w.minutes / max) * 100 }));
  });
  protected readonly dayBars = computed(() => {
    const days = this.weekly.value()?.days ?? [];
    const max = Math.max(30, ...days.map(d => d.minutes));
    return days.map(d => ({ ...d, pct: (d.minutes / max) * 100 }));
  });
  protected readonly confidenceBars = computed(() => {
    const buckets = this.report.value()?.confidence ?? [];
    const max = Math.max(1, ...buckets.map(b => b.count));
    return buckets.map(b => ({ ...b, pct: (b.count / max) * 100 }));
  });
  protected readonly isCurrentWeek = computed(() => !this.weekOf() || this.weekOf()! >= isoDate(new Date()));

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    void this.router.navigate([], { queryParams: { tab: tab === 'overview' ? null : tab }, replaceUrl: true });
  }

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

  protected achievementText(a: Achievement): string { return this.i18n.reason('achievements', a.code, a.params); }
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
      await Promise.all([this.reviews.reload(), this.report.reload()]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.reviewing.set(null);
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

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Achievement } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * Confidence, weekly study time, practice, interviews, achievements and weak areas. Shown in the
 * Progress tab of the Developer Level page (it used to be the Overview tab of /progress).
 */
@Component({
  selector: 'app-progress-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe, DurationPipe,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './progress-overview.component.html',
})
export class ProgressOverviewComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);

  protected readonly report = createLoader(() => this.api.progress());

  /** Bar heights for the weekly chart, relative to the busiest week (minimum scale 60 min). */
  protected readonly weekBars = computed(() => {
    const weeks = this.report.value()?.weeklyStudy ?? [];
    const max = Math.max(60, ...weeks.map(w => w.minutes));
    return weeks.map(w => ({ ...w, pct: (w.minutes / max) * 100 }));
  });
  protected readonly confidenceBars = computed(() => {
    const buckets = this.report.value()?.confidence ?? [];
    const max = Math.max(1, ...buckets.map(b => b.count));
    return buckets.map(b => ({ ...b, pct: (b.count / max) * 100 }));
  });

  protected achievementText(a: Achievement): string { return this.i18n.reason('achievements', a.code, a.params); }
}

import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Phase, TopicStatus, TopicSummary } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';
import { statusIcon } from '../../shared/status';

@Component({
  selector: 'app-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatNumberPipe,
    PageHeaderComponent, ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './roadmap.page.html',
})
export default class RoadmapPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly data = createLoader(() => this.api.roadmap());
  protected readonly expanded = signal(new Set<number>());
  protected readonly busy = signal<number | null>(null);
  protected readonly statusIcon = statusIcon;

  constructor() {
    // Open the current phase the first time data arrives.
    effect(() => {
      const roadmap = this.data.value();
      if (roadmap?.currentPhaseId && untracked(() => this.expanded().size === 0)) {
        this.expanded.set(new Set([roadmap.currentPhaseId]));
        const fragment = location.hash.replace('#phase-', '');
        if (fragment) this.expanded.update(s => new Set([...s, Number(fragment)]));
      }
    });
  }

  protected isOpen(id: number): boolean { return this.expanded().has(id); }

  protected toggle(id: number): void {
    this.expanded.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  protected setAll(open: boolean): void {
    this.expanded.set(open ? new Set(this.data.value()?.phases.map(p => p.id)) : new Set());
  }

  protected isSqlPhase(phase: Phase): boolean { return phase.slug === 'sql-server-for-dotnet'; }

  /** Quick status change from the roadmap; keeps the existing knowledge and confidence. */
  protected async setStatus(topic: TopicSummary, status: TopicStatus): Promise<void> {
    this.busy.set(topic.id);
    try {
      const knowledge = status === 'Skipped' ? 'AlreadyKnow' : topic.knowledge;
      await this.api.updateTopicProgress(topic.id, { status, knowledge, confidence: topic.confidence ?? (status === 'Skipped' ? 4 : null) });
      this.toast.success(this.i18n.t('topic.saved'));
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Activity, StudyPlanItem } from '../../core/models';
import { SessionDialogService } from '../../layout/session-dialog.component';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, ProgressBarComponent, ProgressRingComponent, SkeletonComponent } from '../../shared/ui.components';

const PLAN_ICONS: Record<string, string> = {
  learn: 'book', practice: 'code', exercise: 'code', challenge: 'target', review: 'repeat', project: 'folder', interview: 'chat',
};

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatNumberPipe,
    ProgressRingComponent, ProgressBarComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './dashboard.page.html',
})
export default class DashboardPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly sessions = inject(SessionDialogService);

  protected readonly data = createLoader(() => this.api.dashboard());
  protected readonly planMinutes = signal(60);
  protected readonly plan = createLoader(() => this.api.studyPlan(this.planMinutes()));
  protected readonly planOptions = [30, 60, 120];

  protected readonly greetingKey = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'dashboard.morning' : h < 18 ? 'dashboard.afternoon' : 'dashboard.evening';
  });

  protected readonly activeProject = computed(() => {
    const projects = this.data.value()?.projects ?? [];
    return projects.find(p => p.status === 'active') ?? projects.find(p => p.status === 'notStarted') ?? projects[0];
  });

  protected readonly todayPercent = computed(() => {
    const d = this.data.value();
    return d ? Math.min(100, (d.minutesToday / Math.max(1, d.dailyGoalMinutes)) * 100) : 0;
  });

  constructor() {
    // Reload after a study session is logged from the top bar.
    effect(() => {
      if (this.sessions.savedCount() > 0) untracked(() => { void this.data.reload(); void this.plan.reload(); });
    });
  }

  protected choosePlan(minutes: number): void {
    this.planMinutes.set(minutes);
    void this.plan.reload();
  }

  protected planIcon(item: StudyPlanItem): string { return PLAN_ICONS[item.kind] ?? 'book'; }

  protected planLink(item: StudyPlanItem): { link: unknown[]; fragment?: string; query?: Record<string, unknown> } {
    switch (item.kind) {
      case 'exercise': return { link: ['/practice', item.exerciseId] };
      case 'practice': return { link: ['/topics', item.topicId], fragment: 'practice' };
      case 'challenge': return { link: ['/topics', item.topicId], fragment: 'challenge' };
      case 'review': return { link: ['/progress'], query: { tab: 'review' } };
      case 'project': return { link: ['/projects', item.projectId], fragment: `task-${item.projectTaskId}` };
      case 'interview': return { link: ['/interviews'], query: { category: item.interviewCategory, mode: 'practice' } };
      default: return { link: ['/topics', item.topicId] };
    }
  }

  protected planTitle(item: StudyPlanItem): string {
    return item.kind === 'interview' && item.interviewCategory
      ? this.i18n.t(`interviewCategory.${item.interviewCategory}`)
      : this.i18n.pick(item.titleEn, item.titleAr);
  }

  protected activityLink(a: Activity): unknown[] | null {
    switch (a.kind) {
      case 'topicCompleted': case 'topicSkipped': case 'studySession': return a.entityId ? ['/topics', a.entityId] : null;
      case 'exerciseCompleted': return ['/practice', a.entityId];
      case 'taskCompleted': return ['/projects', a.parentId];
      default: return ['/notes'];
    }
  }

  protected activityIcon(kind: string): string {
    return ({ topicCompleted: 'check-circle', topicSkipped: 'skip', noteCreated: 'note', noteUpdated: 'edit',
      exerciseCompleted: 'code', taskCompleted: 'folder', studySession: 'clock' } as Record<string, string>)[kind] ?? 'circle';
  }

  protected activityQuery(a: Activity): Record<string, unknown> | null {
    return a.kind === 'noteCreated' || a.kind === 'noteUpdated' ? { id: a.entityId } : null;
  }

  protected logSession(topicId: number | null = null): void { this.sessions.open(topicId); }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PortfolioItem, ProjectTask, ProjectTaskStatus } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { ErrorStateComponent, ProgressBarComponent, ProgressRingComponent, SkeletonComponent } from '../../shared/ui.components';

const URL_PATTERN = /^https?:\/\/\S+$/i;

@Component({
  selector: 'app-project-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, DurationPipe,
    ProgressRingComponent, ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './project-detail.page.html',
})
export default class ProjectDetailPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();
  protected readonly data = createLoader(() => this.api.project(Number(this.id())), { immediate: false });
  protected readonly statuses: ProjectTaskStatus[] = ['NotStarted', 'InProgress', 'Completed', 'Blocked'];
  protected readonly statusIcon = statusIcon;
  protected readonly openMilestones = signal(new Set<number>());
  protected readonly expandedTask = signal<number | null>(null);
  protected readonly busyTask = signal<number | null>(null);
  /** Task id waiting for a "blocked" reason before saving. */
  protected readonly blockingTask = signal<number | null>(null);
  protected readonly blockedReason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });
  protected readonly repoUrl = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500), Validators.pattern(URL_PATTERN)] });

  protected readonly requirements = computed(() => {
    const d = this.data.value();
    return d ? (this.i18n.lang() === 'ar' && d.requirementsAr.length ? d.requirementsAr : d.requirementsEn) : [];
  });

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.load());
    });
  }

  private async load(): Promise<void> {
    await this.data.reload();
    const d = this.data.value();
    if (!d) return;
    this.repoUrl.setValue(d.repositoryUrl ?? '');
    // Open the current milestone, or the one containing the task in the URL fragment (#task-12).
    const taskId = Number(this.route.snapshot.fragment?.replace('task-', ''));
    const withTask = d.milestones.find(m => m.tasks.some(t => t.id === taskId));
    const current = d.milestones.find(m => m.completedTasks < m.totalTasks) ?? d.milestones[0];
    this.openMilestones.set(new Set([withTask?.id ?? current?.id].filter((x): x is number => !!x)));
    if (taskId) {
      this.expandedTask.set(taskId);
      setTimeout(() => document.getElementById(`task-${taskId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }

  protected toggleMilestone(id: number): void {
    this.openMilestones.update(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  protected toggleTask(id: number): void { this.expandedTask.update(v => (v === id ? null : id)); }

  protected criteria(task: ProjectTask): string[] {
    return this.i18n.lang() === 'ar' && task.criteriaAr.length ? task.criteriaAr : task.criteriaEn;
  }

  protected chooseStatus(task: ProjectTask, status: ProjectTaskStatus): void {
    if (status === 'Blocked') {
      this.blockingTask.set(task.id);
      this.blockedReason.reset(task.blockedReason ?? '');
      this.expandedTask.set(task.id);
      return;
    }
    void this.saveStatus(task, status, null);
  }

  protected confirmBlocked(task: ProjectTask): void {
    if (this.blockedReason.invalid) { this.blockedReason.markAsTouched(); return; }
    void this.saveStatus(task, 'Blocked', this.blockedReason.value.trim());
  }

  private async saveStatus(task: ProjectTask, status: ProjectTaskStatus, reason: string | null): Promise<void> {
    this.busyTask.set(task.id);
    try {
      await this.api.updateTask(task.id, status, reason);
      this.blockingTask.set(null);
      this.toast.success(this.i18n.t('projects.taskUpdated'));
      await this.data.reload();   // progress, milestone and change-request unlocks are recalculated by the API
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busyTask.set(null);
    }
  }

  protected async togglePortfolio(item: PortfolioItem): Promise<void> {
    const d = this.data.value();
    if (!d) return;
    try {
      const saved = await this.api.setPortfolio(d.summary.id, item.id, !item.isDone);
      this.data.update(v => ({
        ...v,
        portfolio: v.portfolio.map(i => (i.id === saved.id ? saved : i)),
        summary: { ...v.summary, portfolioDone: v.summary.portfolioDone + (saved.isDone ? 1 : -1) },
      }));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected async saveRepo(): Promise<void> {
    const d = this.data.value();
    if (!d || this.repoUrl.invalid) { this.repoUrl.markAsTouched(); return; }
    try {
      await this.api.setRepository(d.summary.id, this.repoUrl.value.trim() || null);
      this.toast.success(this.i18n.t('projects.repoSaved'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }
}

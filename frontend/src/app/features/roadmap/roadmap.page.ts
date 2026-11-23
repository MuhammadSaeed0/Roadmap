import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Phase, TopicStatus, TopicSummary } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { LibraryListComponent } from '../library/library-list.component';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';
import { statusIcon } from '../../shared/status';

@Component({
  selector: 'app-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, LibraryListComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatNumberPipe,
    PageHeaderComponent, ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './roadmap.page.html',
})
export default class RoadmapPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** "phases" (the timeline) or "list" (every topic, searchable and filterable). Kept in ?view= so links and the back button work. */
  protected readonly view = signal<'phases' | 'list'>('phases');

  protected readonly data = createLoader(() => this.api.roadmap());
  protected readonly expanded = signal(new Set<number>());
  protected readonly busy = signal<number | null>(null);
  /** The phase whose certificate is being fetched. */
  protected readonly certificateBusy = signal<number | null>(null);
  protected readonly statusIcon = statusIcon;

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed())
      .subscribe(q => this.view.set(q.get('view') === 'list' ? 'list' : 'phases'));
    // Open the current phase the first time data arrives, and the phase a link points at (#phase-<id>, e.g. from the Pre-Roadmap page).
    effect(() => {
      const roadmap = this.data.value();
      if (!roadmap || untracked(() => this.expanded().size > 0)) return;
      const open = new Set<number>(roadmap.currentPhaseId ? [roadmap.currentPhaseId] : []);
      const linked = Number(location.hash.replace('#phase-', ''));
      if (linked && roadmap.phases.some(p => p.id === linked)) {
        open.add(linked);
        setTimeout(() => document.getElementById('phase-' + linked)?.scrollIntoView({ block: 'start' }), 0);
      }
      if (open.size > 0) this.expanded.set(open);
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

  /** From the phase rail: open the phase and bring it into view. */
  protected jump(id: number): void {
    this.expanded.update(s => new Set([...s, id]));
    setTimeout(() => document.getElementById('phase-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  protected setAll(open: boolean): void {
    this.expanded.set(open ? new Set(this.data.value()?.phases.map(p => p.id)) : new Set());
  }


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

  protected setView(view: 'phases' | 'list'): void {
    // Switching drops the list's filters; they belong to the list view only.
    void this.router.navigate([], { queryParams: view === 'list' ? { view } : {}, replaceUrl: true });
  }

  /** Gets the phase certificate (issued on the first request) and opens its page. */
  protected async openCertificate(phaseId: number): Promise<void> {
    this.certificateBusy.set(phaseId);
    try {
      const certificate = await this.api.issueCertificate(phaseId);
      await this.router.navigate(['/c', certificate.code]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.certificateBusy.set(null);
    }
  }
}

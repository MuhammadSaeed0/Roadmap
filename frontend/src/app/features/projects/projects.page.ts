import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressRingComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, PageHeaderComponent,
    ProgressRingComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <app-page-header [title]="'projects.title' | t" [subtitle]="'projects.subtitle' | t" />
    @if (data.initialLoading()) {
      <div class="grid grid-2">@for (i of [1, 2, 3, 4]; track i) { <div class="card"><app-skeleton [rows]="5" /></div> }</div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as projects) {
      <div class="grid grid-2" data-tour="projects-list">
        @for (p of projects; track p.id) {
          <article class="card project-card" [attr.data-status]="p.status">
            <div class="project-card-head">
              <span class="project-num lg">{{ p.order }}</span>
              <div class="grow">
                <h2 class="project-title"><a [routerLink]="['/projects', p.id]">{{ p | loc: 'title' }}</a></h2>
                <p class="muted small" dir="ltr">{{ p.techStack }}</p>
              </div>
              <app-progress-ring [value]="p.percent" [size]="72" [stroke]="7" [label]="('projects.overallProgress' | t) + ': ' + (p | loc: 'title')" />
            </div>
            <p>{{ p | loc: 'summary' }}</p>
            <dl class="kv">
              <div><dt>{{ 'common.total' | t }}</dt><dd>{{ 'projects.tasks' | t: { done: p.completedTasks, total: p.totalTasks } }}</dd></div>
              <div><dt>{{ 'projects.currentMilestone' | t }}</dt><dd>{{ p.currentMilestoneEn ? (p | loc: 'currentMilestone') : '—' }}</dd></div>
              <div><dt>{{ 'projects.changeRequests' | t }}</dt><dd>{{ 'projects.crCount' | t: { done: p.changeRequestsDone, unlocked: p.changeRequestsUnlocked } }}</dd></div>
              <div><dt>{{ 'projects.portfolio' | t }}</dt><dd>{{ p.portfolioDone }}/{{ p.portfolioTotal }}</dd></div>
            </dl>
            <div class="project-card-foot">
              <span class="badge" [attr.data-status]="p.status">{{ 'projectStatus.' + p.status | t }}</span>
              <span class="muted small">{{ 'projects.startAfter' | t: { phase: (p.startAfterPhase | loc: 'title') } }}</span>
              @if (p.blockedTasks > 0) { <span class="chip chip-sm chip-warn"><app-icon name="alert" [size]="12" /> {{ 'taskStatus.Blocked' | t }}: {{ p.blockedTasks }}</span> }
              <a class="btn btn-primary btn-sm push-end" [routerLink]="['/projects', p.id]">{{ 'projects.open' | t }} <app-icon name="arrow-right" [size]="14" /></a>
            </div>
          </article>
        }
      </div>
    }
  `,
})
export default class ProjectsPage {
  private readonly api = inject(ApiService);
  protected readonly data = createLoader(() => this.api.projects());
}

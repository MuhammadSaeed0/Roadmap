import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import '../../core/i18n/workspace-strings';
import { FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PlaygroundProjectSummary, WorkspaceKind } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { templatesFor } from '../../core/workspace/templates';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

export const WORKSPACE_ICONS: Record<WorkspaceKind, string> = {
  CSharp: 'code', Sql: 'database', JavaScript: 'terminal', TypeScript: 'terminal', Web: 'globe', Angular: 'layers',
};
const KINDS: WorkspaceKind[] = ['CSharp', 'Sql', 'Angular', 'TypeScript', 'JavaScript', 'Web'];

/** Code Playground: pick an environment and a template, or reopen a saved project. */
@Component({
  selector: 'app-playground-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'playground.title' | t" [subtitle]="'playground.subtitle' | t" />
    <p class="callout small" data-tour="playground-security"><app-icon name="shield" [size]="15" /> {{ 'playground.securityNote' | t }}</p>

    <section aria-labelledby="pg-env-h" data-tour="playground-environments">
      <h2 id="pg-env-h" class="section-title">{{ 'playground.environments' | t }}</h2>
      <div class="grid grid-3">
        @for (kind of kinds; track kind) {
          <article class="card env-card" [attr.data-kind]="kind">
            <h3><span class="stat-icon"><app-icon [name]="icons[kind]" /></span> {{ ('playground.kind.' + kind) | t }}</h3>
            <p class="muted small">{{ ('playground.kindInfo.' + kind) | t }}</p>
            <ul class="env-templates">
              @for (tpl of templates(kind); track tpl.key) {
                <li>
                  <a [routerLink]="['/playground/new', tpl.key]" class="env-template">
                    <strong>{{ tpl | loc: 'name' }}</strong>
                    <span class="small muted">{{ tpl | loc: 'description' }}</span>
                  </a>
                </li>
              }
            </ul>
          </article>
        }
      </div>
    </section>

    <section aria-labelledby="pg-projects-h" class="section-gap" data-tour="playground-projects">
      <h2 id="pg-projects-h" class="section-title">{{ 'playground.myProjects' | t }}</h2>
      @if (projects.initialLoading()) {
        <div class="card"><app-skeleton [rows]="3" /></div>
      } @else if (projects.error()) {
        <app-error-state [error]="projects.error()" (retry)="projects.reload()" />
      } @else if (projects.value(); as list) {
        @if (list.length === 0) {
          <app-empty-state icon="folder" [title]="'playground.noProjects' | t" [message]="'playground.noProjectsHint' | t" />
        } @else {
          <ul class="card project-rows" role="list">
            @for (p of list; track p.id) {
              <li>
                <span class="stat-icon"><app-icon [name]="icons[p.kind]" [size]="16" /></span>
                <a [routerLink]="['/playground', p.id]" class="grow">
                  <strong>{{ p.name }}</strong>
                  <span class="small muted">{{ ('playground.kind.' + p.kind) | t }} · {{ 'playground.files' | t: { n: p.fileCount } }} · {{ 'playground.updated' | t: { date: (p.updatedAt | fmtDate) } }}</span>
                </a>
                <button type="button" class="icon-btn" (click)="remove(p)" [attr.aria-label]="'playground.deleteProject' | t: { name: p.name }"><app-icon name="trash" [size]="15" /></button>
              </li>
            }
          </ul>
        }
      }
    </section>
  `,
})
export default class PlaygroundPage {
  private readonly api = inject(ApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly kinds = KINDS;
  protected readonly icons = WORKSPACE_ICONS;
  protected readonly projects = createLoader(() => this.api.playgroundProjects());
  protected templates = templatesFor;

  protected async remove(project: PlaygroundProjectSummary): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('playground.deleteConfirm', { name: project.name }), danger: true, confirmText: this.i18n.t('common.delete') }))) return;
    try {
      await this.api.deletePlaygroundProject(project.id);
      this.projects.update(list => list.filter(p => p.id !== project.id));
      this.toast.success(this.i18n.t('playground.deleted'));
    } catch {
      this.toast.error(this.i18n.t('errors.generic'));
    }
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, FormatNumberPipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

/** A learner's public profile at /u/{handle}. Readable without an account; shown only if its owner made it public. */
@Component({
  selector: 'app-public-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe, FormatNumberPipe, EmptyStateComponent, ProgressBarComponent, SkeletonComponent],
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; width: min(860px, 100%); margin-inline: auto; }
    :host > .card { margin: 0; }
    .hero { display: flex; gap: 18px; align-items: center; }
    .avatar-lg { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; flex: none;
      background: var(--accent-soft); color: var(--accent-text); font-size: 1.4rem; font-weight: 700; }
    .hero h1 { margin: 0; font-size: 1.5rem; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .stat { display: flex; flex-direction: column; gap: 2px; padding: 12px; border-radius: var(--radius-sm); background: var(--surface-2); }
    .stat strong { font-size: 1.3rem; font-variant-numeric: tabular-nums; }
    .rows { display: flex; flex-direction: column; gap: 12px; list-style: none; margin: 0; padding: 0; }
    .rows li { display: flex; flex-direction: column; gap: 6px; }
    @media (max-width: 640px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
  template: `
    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error() || !data.value()) {
      <app-empty-state icon="user" [title]="'profile.notFound' | t" [message]="'profile.notFoundHint' | t">
        <a routerLink="/" class="btn btn-secondary btn-sm">DevPath</a>
      </app-empty-state>
    } @else if (data.value(); as p) {
      <section class="card hero">
        <span class="avatar-lg" aria-hidden="true">{{ initials(p.name) }}</span>
        <div>
          <h1 dir="auto">{{ p.name }}</h1>
          <p class="muted small" dir="ltr">&#64;{{ p.handle }}</p>
          <p class="muted small">{{ 'profile.memberSince' | t: { date: (p.memberSince | fmtDate) } }}</p>
          <span class="badge badge-accent">{{ 'devLevel.levels.' + p.level | t }}</span>
        </div>
      </section>

      <section class="card">
        <div class="stats">
          <div class="stat"><strong>{{ p.xp | fmtNum }}</strong><span class="tiny muted">{{ 'profile.xp' | t }}</span></div>
          <div class="stat"><strong>{{ p.topicsCompleted | fmtNum }}</strong><span class="tiny muted">{{ 'profile.topics' | t }}</span></div>
          <div class="stat"><strong>{{ p.acceptedAnswers | fmtNum }}</strong><span class="tiny muted">{{ 'profile.answers' | t }}</span></div>
          <div class="stat"><strong>{{ p.reviewedProjects | fmtNum }}</strong><span class="tiny muted">{{ 'profile.reviewed' | t }}</span></div>
        </div>
      </section>

      @if (p.paths.length > 0) {
        <section class="card">
          <h2 class="section-title"><app-icon name="route" /> {{ 'paths.title' | t }}</h2>
          <ul class="rows" role="list">
            @for (path of p.paths; track path.id) {
              <li>
                <div class="row-between small"><span>{{ i18n.pick(path.nameEn, path.nameAr) }}</span><span class="muted">{{ 'paths.progress' | t: { n: round(path.percent) } }}</span></div>
                <app-progress-bar [value]="path.percent" [small]="true" [tone]="path.percent >= 100 ? 'success' : 'accent'" [label]="i18n.pick(path.nameEn, path.nameAr)" />
              </li>
            }
          </ul>
        </section>
      }

      <section class="card">
        <h2 class="section-title"><app-icon name="folder" /> {{ 'profile.projects' | t }}</h2>
        @if (p.projects.length === 0) {
          <p class="muted">{{ 'profile.noProjects' | t }}</p>
        } @else {
          <ul class="rows" role="list">
            @for (project of p.projects; track project.id) {
              <li>
                <div class="row-between">
                  <strong>{{ i18n.pick(project.titleEn, project.titleAr) }}</strong>
                  @if (project.peerReviewed) { <span class="badge badge-success"><app-icon name="check" [size]="12" /> {{ 'profile.peerReviewed' | t }}</span> }
                </div>
                <span class="tiny muted" dir="ltr">{{ project.techStack }}</span>
                @if (project.repositoryUrl) {
                  <a class="small" [href]="project.repositoryUrl" target="_blank" rel="noopener noreferrer nofollow" dir="ltr">
                    <app-icon name="external" [size]="13" /> {{ project.repositoryUrl }}</a>
                }
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export default class PublicProfilePage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly handle = inject(ActivatedRoute).snapshot.paramMap.get('handle') ?? '';
  protected readonly data = createLoader(() => this.api.publicProfile(this.handle));
  protected readonly round = Math.round;

  protected initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }
}

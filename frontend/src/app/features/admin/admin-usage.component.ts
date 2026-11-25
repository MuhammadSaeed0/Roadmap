import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, FormatNumberPipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { AdminApiService } from './admin-api.service';

/** How many days the Usage tab shows. */
export const USAGE_DAYS = 60;

/**
 * Readable names for the route patterns the usage tracker records: the menu name for a list page, a short
 * description for a detail page. A pattern missing here is shown as its path only.
 */
const PAGE_NAMES: Record<string, string> = {
  '': 'nav.dashboard', 'pre-roadmap': 'nav.preRoadmap', placement: 'placement.title', roadmap: 'nav.roadmap',
  glossary: 'nav.glossary', 'topics/:id': 'admin.usage.pages.topic',
  projects: 'nav.projects', 'projects/:id': 'admin.usage.pages.project',
  'project-library': 'nav.guides', 'project-library/:id': 'admin.usage.pages.guide',
  practice: 'nav.practice', 'practice/:id': 'admin.usage.pages.exercise',
  playground: 'nav.playground', 'playground/new/:template': 'admin.usage.pages.workspaceNew', 'playground/:id': 'admin.usage.pages.workspace',
  videos: 'nav.videos', interviews: 'nav.interviews', resources: 'nav.resources', notes: 'nav.notes', progress: 'nav.progress',
  cv: 'nav.cv', 'cv/:id': 'admin.usage.pages.cvEditor', skills: 'nav.skills', tracks: 'nav.tracks', settings: 'nav.settings', search: 'nav.search',
  discussions: 'nav.discussions', 'discussions/:id': 'admin.usage.pages.discussion', reviews: 'nav.reviews',
  paths: 'nav.paths', 'paths/new': 'admin.usage.pages.pathNew', 'paths/:id/edit': 'admin.usage.pages.pathEdit', 'paths/:id': 'admin.usage.pages.path',
  marketing: 'nav.marketing', admin: 'nav.admin', 'u/:handle': 'admin.usage.pages.profile', 'c/:code': 'admin.usage.pages.certificate',
  'verify-email': 'verify.title', 'account-status': 'status.title', 'change-password': 'auth.changePassword',
};

/** The translation key of a route pattern's readable name, or null when it has none. */
export function pageNameKey(route: string): string | null {
  return Object.hasOwn(PAGE_NAMES, route) ? PAGE_NAMES[route] : null;
}

/**
 * The admin Usage tab: page views per day and the most opened pages over the last 60 days, and how many
 * learners started and finished Project library projects. Counts only; nothing names a person.
 */
@Component({
  selector: 'app-admin-usage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, FormatDatePipe, FormatNumberPipe, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  styles: `
    :host { display: grid; gap: 16px; }
    .usage-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .days { display: flex; align-items: flex-end; gap: 2px; height: 140px; padding-top: 8px; }
    .day { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
    .day-fill { display: block; background: var(--accent); border-radius: 3px 3px 0 0; min-height: 2px; }
    .day-axis { display: flex; justify-content: space-between; margin-top: 6px; }
    .page-name { display: block; }
    .route { display: block; font-family: var(--font-mono, monospace); font-size: 0.85rem; overflow-wrap: anywhere; }
    .route.tiny { font-size: 0.75rem; }
    td.num, th.num { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
  `,
  template: `
    @if (report.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (report.error()) {
      <app-error-state [error]="report.error()" (retry)="report.reload()" />
    } @else if (report.value(); as r) {
      <p class="callout small"><app-icon name="info" [size]="15" /> {{ 'admin.usage.privacy' | t }}</p>

      <div class="usage-stats">
        <div class="card stat-card"><span class="stat-label">{{ 'admin.usage.views' | t }}</span><span class="stat-value">{{ r.totalViews | fmtNum }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'admin.usage.started' | t }}</span><span class="stat-value">{{ r.library.learnersStarted | fmtNum }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'admin.usage.finished' | t }}</span><span class="stat-value">{{ r.library.learnersFinished | fmtNum }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'admin.usage.projectsFinished' | t }}</span><span class="stat-value">{{ r.library.projectsFinished | fmtNum }}</span></div>
      </div>

      <section class="card" aria-labelledby="usage-days-h">
        <h2 id="usage-days-h" class="card-title"><app-icon name="chart" /> {{ 'admin.usage.perDay' | t }}</h2>
        <div class="days" role="img" [attr.aria-label]="'admin.usage.perDay' | t">
          @for (d of days(); track d.date) {
            <div class="day" [title]="(d.date | fmtDate) + ': ' + d.views"><span class="day-fill" [style.height.%]="d.pct"></span></div>
          }
        </div>
        <div class="day-axis tiny muted"><span>{{ r.from | fmtDate: 'short' }}</span><span>{{ r.to | fmtDate: 'short' }}</span></div>
      </section>

      <section class="card" aria-labelledby="usage-src-h">
        <h2 id="usage-src-h" class="card-title"><app-icon name="external" /> {{ 'admin.usage.sources' | t }}</h2>
        <p class="muted small">{{ 'admin.usage.sourcesHint' | t }}</p>
        @if ((r.sources ?? []).length === 0) {
          <app-empty-state icon="chart" [title]="'admin.usage.sourcesEmpty' | t" />
        } @else {
          <div class="table-scroll">
            <table class="table">
              <thead><tr>
                <th scope="col">{{ 'admin.usage.source' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.visits' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.signUps' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.rate' | t }}</th>
              </tr></thead>
              <tbody>
                @for (s of r.sources; track s.source) {
                  <tr>
                    <td><bdi dir="ltr">{{ s.source }}</bdi></td>
                    <td class="num">{{ s.visits | fmtNum }}</td>
                    <td class="num">{{ s.signUps | fmtNum }}</td>
                    <td class="num"><bdi dir="ltr">{{ rate(s) }}</bdi></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      @if ((r.roadmaps ?? []).length > 1) {
        <section class="card" aria-labelledby="usage-roadmaps-h">
          <h2 id="usage-roadmaps-h" class="card-title"><app-icon name="map" /> {{ 'admin.usage.roadmaps' | t }}</h2>
          <div class="table-scroll">
            <table class="table">
              <thead><tr>
                <th scope="col">{{ 'admin.usage.roadmap' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.learners' | t }}</th>
              </tr></thead>
              <tbody>
                @for (m of r.roadmaps; track m.slug) {
                  <tr>
                    <td>{{ m.slug ? i18n.pick(m.titleEn, m.titleAr) : ('admin.usage.notChosen' | t) }}</td>
                    <td class="num">{{ m.learners | fmtNum }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      <section class="card" aria-labelledby="usage-top-h" data-tour="admin-usage">
        <h2 id="usage-top-h" class="card-title"><app-icon name="layers" /> {{ 'admin.usage.topPages' | t }}</h2>
        @if (r.topPages.length === 0) {
          <app-empty-state icon="chart" [title]="'admin.usage.empty' | t" />
        } @else {
          <div class="table-scroll">
            <table class="table">
              <thead><tr>
                <th scope="col">{{ 'admin.usage.page' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.views' | t }}</th>
                <th scope="col" class="num">{{ 'admin.usage.days' | t }}</th>
              </tr></thead>
              <tbody>
                @for (p of r.topPages; track p.route) {
                  <tr>
                    <td>
                      @if (pageName(p.route); as key) { <span class="page-name">{{ key | t }}</span> }
                      <span class="route" [class.muted]="pageName(p.route)" [class.tiny]="pageName(p.route)" dir="ltr">/{{ p.route }}</span>
                    </td>
                    <td class="num">{{ p.views | fmtNum }}</td>
                    <td class="num">{{ p.days }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    }
  `,
})
export class AdminUsageComponent {
  private readonly api = inject(AdminApiService);
  protected readonly i18n = inject(I18nService);
  protected readonly report = createLoader(() => this.api.usage(USAGE_DAYS));
  protected readonly pageName = pageNameKey;

  /** New accounts per 100 guest visits from a source; a dash when there were no visits. */
  protected rate(s: { visits: number; signUps: number }): string {
    return s.visits ? `${Math.round((s.signUps / s.visits) * 100)}%` : '–';
  }

  protected readonly days = computed(() => {
    const daily = this.report.value()?.daily ?? [];
    const max = Math.max(1, ...daily.map(d => d.views));
    return daily.map(d => ({ ...d, pct: (d.views / max) * 100 }));
  });
}

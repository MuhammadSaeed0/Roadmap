import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormatDatePipe, FormatNumberPipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { AdminApiService } from './admin-api.service';

/**
 * The admin Usage tab: page views per day and the most opened pages over the last 30 days, and how many
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
    .route { font-family: var(--font-mono, monospace); font-size: 0.85rem; overflow-wrap: anywhere; }
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
                    <td><span class="route" dir="ltr">/{{ p.route }}</span></td>
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
  protected readonly report = createLoader(() => this.api.usage(30));

  protected readonly days = computed(() => {
    const daily = this.report.value()?.daily ?? [];
    const max = Math.max(1, ...daily.map(d => d.views));
    return daily.map(d => ({ ...d, pct: (d.views / max) * 100 }));
  });
}

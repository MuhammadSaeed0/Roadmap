import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PortfolioItem, Reason, ReadinessArea } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

const AREA_ICONS: Record<string, string> = {
  coreTopics: 'book', confidence: 'target', projects: 'folder', features: 'layers',
  testing: 'shield', debugging: 'bug', interview: 'chat', portfolio: 'award',
};

@Component({
  selector: 'app-career-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatNumberPipe, PageHeaderComponent,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <app-page-header [title]="'career.title' | t" [subtitle]="'career.subtitle' | t" />
    <p class="callout callout-info"><app-icon name="info" /> {{ 'career.disclaimer' | t }}</p>

    @if (data.initialLoading()) {
      <div class="grid grid-2">@for (i of [1, 2, 3, 4]; track i) { <div class="card"><app-skeleton [rows]="4" /></div> }</div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as r) {
      <section class="card focus-card" aria-labelledby="gaps-h" data-tour="career-gaps">
        <h2 id="gaps-h" class="card-title"><app-icon name="target" /> {{ 'career.topGaps' | t }}</h2>
        @if (r.topGaps.length === 0) {
          <p>{{ 'career.noGaps' | t }}</p>
        } @else {
          <div class="chips">
            @for (g of r.topGaps; track g) { <a class="chip chip-warn chip-link" [href]="'#area-' + g">{{ 'career.areas.' + g + '.title' | t }}</a> }
          </div>
        }
      </section>

      <div class="grid grid-2" data-tour="career-areas">
        @for (a of r.areas; track a.key) {
          <article class="card area-card" [id]="'area-' + a.key" [attr.data-level]="a.level">
            <div class="area-head">
              <span class="area-icon"><app-icon [name]="icon(a.key)" /></span>
              <h2 class="grow">{{ 'career.areas.' + a.key + '.title' | t }}</h2>
              <span class="level-pill" [attr.data-level]="a.level">{{ 'career.levels.' + a.level | t }}</span>
            </div>
            <app-progress-bar [value]="a.score" [tone]="tone(a)" [label]="'career.areas.' + a.key + '.title' | t" />
            <p class="small"><strong>{{ 'career.why' | t }}:</strong> {{ 'career.areas.' + a.key + '.why' | t }}</p>
            <p class="label">{{ 'career.evidenceTitle' | t }}</p>
            <ul class="evidence" role="list">
              @for (e of a.evidence; track e.code) {
                <li><span>{{ 'career.evidence.' + e.code | t }}</span><strong>{{ e.value | fmtNum: 1 }} / {{ e.target | fmtNum }}</strong></li>
              }
            </ul>
            <p class="next-step"><app-icon name="arrow-right" [size]="14" />
              @if (stepLink(a.nextStep); as link) { <a [routerLink]="link">{{ stepText(a.nextStep) }}</a> }
              @else { <span>{{ stepText(a.nextStep) }}</span> }
            </p>
          </article>
        }
      </div>

      <section class="card" id="portfolio" aria-labelledby="port-h" data-tour="career-portfolio">
        <h2 id="port-h" class="card-title"><app-icon name="award" /> {{ 'career.portfolio' | t }}</h2>
        <p class="muted small">{{ 'career.portfolioIntro' | t }}</p>
        <div class="table-scroll">
          <table class="table portfolio-table">
            <caption class="sr-only">{{ 'career.portfolio' | t }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ 'career.portfolio' | t }}</th>
                @for (p of r.portfolio; track p.projectId) { <th scope="col"><a [routerLink]="['/projects', p.projectId]">{{ p | loc: 'title' }}</a></th> }
              </tr>
            </thead>
            <tbody>
              @for (item of r.portfolio[0]?.items ?? []; track item.id; let i = $index) {
                <tr>
                  <th scope="row"><span class="block">{{ item | loc: 'title' }}</span><span class="tiny muted">{{ item | loc: 'description' }}</span></th>
                  @for (p of r.portfolio; track p.projectId) {
                    <td class="center">
                      <input type="checkbox" [checked]="p.items[i].isDone" (change)="toggle(p.projectId, p.items[i])"
                             [attr.aria-label]="(p | loc: 'title') + ': ' + (item | loc: 'title')" />
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
  `,
})
export default class CareerPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  protected readonly data = createLoader(() => this.api.careerReadiness());

  protected icon(key: string): string { return AREA_ICONS[key] ?? 'target'; }
  protected tone(a: ReadinessArea): 'danger' | 'warning' | 'accent' | 'success' {
    return a.level === 'gap' ? 'danger' : a.level === 'developing' ? 'warning' : a.level === 'solid' ? 'accent' : 'success';
  }

  protected stepText(step: Reason): string { return this.i18n.reason('career.steps', step.code, step.params); }

  protected stepLink(step: Reason): unknown[] | null {
    if (step.params?.['topicId']) return ['/topics', step.params['topicId']];
    if (step.params?.['projectId']) return ['/projects', step.params['projectId']];
    switch (step.code) {
      case 'practiceDebugging': return ['/practice'];
      case 'practiceInterview': return ['/interviews'];
      case 'rateConfidence': case 'keepReviewing': return ['/roadmap'];
      case 'tryChangeRequests': case 'polishPortfolio': case 'writeMoreTests': return ['/projects'];
      default: return null;
    }
  }

  protected async toggle(projectId: number, item: PortfolioItem): Promise<void> {
    try {
      await this.api.setPortfolio(projectId, item.id, !item.isDone);
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }
}

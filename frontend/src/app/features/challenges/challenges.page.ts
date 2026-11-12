import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Challenge, Difficulty } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * Challenges: every exercise with automatic checks, by domain and difficulty, with points for each one solved. The checks run in the browser, so the points are a personal record, not a verified grade.
 */
@Component({
  selector: 'app-challenges-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatNumberPipe, PageHeaderComponent,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  styles: `
    .score { display: flex; flex-wrap: wrap; gap: 8px 32px; align-items: baseline; }
    .score strong { font-size: 1.6rem; font-weight: 600; font-variant-numeric: tabular-nums; }
    .domains { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin: 16px 0; }
    .domain { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: none; color: var(--text); text-align: start; cursor: pointer; }
    .domain:hover { background: var(--surface-2); }
    .domain.selected { border-color: var(--accent); background: var(--accent-soft); }
    .domain-head { display: flex; justify-content: space-between; gap: 8px; font-weight: 600; }
    .num { font-variant-numeric: tabular-nums; text-align: end; white-space: nowrap; }
    .solved-mark { color: var(--success); }
    td a { font-weight: 500; }
  `,
  template: `
    @if (!embedded()) {
      <app-page-header [title]="'challenges.title' | t" [subtitle]="'challenges.subtitle' | t" />
    }

    @if (data.initialLoading()) {
        <div class="card"><app-skeleton [rows]="6" /></div>
      } @else if (data.error()) {
        <app-error-state [error]="data.error()" (retry)="data.reload()" />
      } @else if (data.value(); as d) {
        <section class="card" aria-labelledby="score-h">
          <h2 id="score-h" class="sr-only">{{ 'challenges.yourScore' | t }}</h2>
          <div class="score">
            <span><strong>{{ d.points | fmtNum }}</strong> <span class="muted">/ {{ d.maxPoints | fmtNum }} {{ 'challenges.points' | t }}</span></span>
            <span><strong>{{ d.solved }}</strong> <span class="muted">/ {{ d.items.length }} {{ 'challenges.solved' | t }}</span></span>
          </div>
          <div class="domains" role="group" [attr.aria-label]="'challenges.domains' | t">
            @for (dom of d.domains; track dom.key) {
              <button type="button" class="domain" [class.selected]="domain() === dom.key" [attr.aria-pressed]="domain() === dom.key"
                      (click)="domain.set(domain() === dom.key ? '' : dom.key)">
                <span class="domain-head"><span>{{ domainName(dom.key) }}</span><span class="num">{{ dom.solved }}/{{ dom.total }}</span></span>
                <app-progress-bar [value]="dom.total ? (dom.solved / dom.total) * 100 : 0" [small]="true" tone="success" [label]="domainName(dom.key)" />
                <span class="small muted">{{ dom.points }} / {{ dom.maxPoints }} {{ 'challenges.points' | t }}</span>
              </button>
            }
          </div>
          <p class="small muted">{{ 'challenges.selfReported' | t }}</p>
        </section>

        <div class="toolbar">
          <div class="segmented" role="radiogroup" [attr.aria-label]="'practice.allDifficulties' | t">
            <button type="button" role="radio" [class.active]="difficulty() === ''" [attr.aria-checked]="difficulty() === ''" (click)="difficulty.set('')">{{ 'practice.allDifficulties' | t }}</button>
            @for (lvl of levels; track lvl) {
              <button type="button" role="radio" [class.active]="difficulty() === lvl" [attr.aria-checked]="difficulty() === lvl" (click)="difficulty.set(lvl)">{{ 'difficulty.' + lvl | t }}</button>
            }
          </div>
          <label class="check-label small"><input type="checkbox" [checked]="unsolvedOnly()" (change)="unsolvedOnly.set($any($event.target).checked)"> {{ 'challenges.unsolvedOnly' | t }}</label>
        </div>

        @if (visible().length === 0) {
          <app-empty-state icon="code" [title]="'challenges.empty' | t" />
        } @else {
          <section class="card table-card" data-tour="challenges-list">
            <div class="table-scroll">
              <table class="table">
                <caption class="sr-only">{{ 'challenges.title' | t }}</caption>
                <thead>
                  <tr>
                    <th scope="col">{{ 'challenges.colChallenge' | t }}</th>
                    <th scope="col">{{ 'challenges.colDomain' | t }}</th>
                    <th scope="col">{{ 'challenges.colDifficulty' | t }}</th>
                    <th scope="col" class="num">{{ 'challenges.colTime' | t }}</th>
                    <th scope="col" class="num">{{ 'challenges.points' | t }}</th>
                    <th scope="col">{{ 'challenges.colStatus' | t }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of visible(); track c.id) {
                    <tr>
                      <th scope="row"><a [routerLink]="['/practice', c.id]">{{ c | loc: 'title' }}</a></th>
                      <td>{{ domainName(c.domain) }}</td>
                      <td><span class="chip chip-sm" [attr.data-difficulty]="c.difficulty">{{ 'difficulty.' + c.difficulty | t }}</span></td>
                      <td class="num">{{ c.estimatedMinutes | duration }}</td>
                      <td class="num">{{ c.points }}</td>
                      <td>
                        @if (c.solved) { <span class="solved-mark"><app-icon name="check-circle" [size]="15" /> {{ 'challenges.statusSolved' | t }}</span> }
                        @else if (c.submissions > 0) { <span>{{ 'challenges.statusTried' | t: { score: c.bestScore ?? 0 } }}</span> }
                        @else { <span class="muted">{{ 'challenges.statusNew' | t }}</span> }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      }

  `,
})
export default class ChallengesPage {
  /** Shown inside the Code Playground's Challenges tab, which has its own header. */
  readonly embedded = input(false);
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  protected readonly data = createLoader(() => this.api.challenges());
  protected readonly domain = signal('');
  protected readonly difficulty = signal<Difficulty | ''>('');
  protected readonly unsolvedOnly = signal(false);
  protected readonly levels: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  protected readonly visible = computed<Challenge[]>(() => (this.data.value()?.items ?? []).filter(c =>
    (!this.domain() || c.domain === this.domain()) &&
    (!this.difficulty() || c.difficulty === this.difficulty()) &&
    (!this.unsolvedOnly() || !c.solved)));

  /** Challenge sets such as Algorithms have their own names; the other domains are roadmap technologies. */
  protected domainName(key: string): string {
    const own = 'challenges.domainNames.' + key;
    return this.i18n.has(own) ? this.i18n.t(own) : this.i18n.t('skills.' + key);
  }

}

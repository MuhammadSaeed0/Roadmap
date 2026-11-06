import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, FormatNumberPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { EvidenceScore, ItemRef, SkillAction, SkillRequirement, XpTransaction } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, ProgressRingComponent, SkeletonComponent } from '../../shared/ui.components';

type Tone = 'danger' | 'warning' | 'accent' | 'success';

/**
 * Developer level: the level reached, the competency scores behind it, the technology profile, weaknesses,
 * exactly what the next level needs, adaptive skill checks and the points history. All numbers come from
 * GET /api/skill-level; the page only presents them.
 */
@Component({
  selector: 'app-skill-level-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatNumberPipe, FormatDatePipe, PageHeaderComponent,
    ProgressBarComponent, ProgressRingComponent, SkeletonComponent, ErrorStateComponent],
  styles: `
    .level-hero { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 24px; align-items: center; }
    .level-name { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.02em; margin: 2px 0 6px; }
    .ladder { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .rung { padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface-2); font-size: 0.8rem; min-width: 0; }
    .rung strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rung[data-state='reached'] { background: var(--success-soft); border-color: transparent; }
    .rung[data-state='current'] { border-color: var(--accent); box-shadow: var(--focus); }
    .tier { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: var(--surface-3); color: var(--text-2); white-space: nowrap; }
    .tier[data-tier='QuizVerified'], .tier[data-tier='Reviewed'] { background: var(--success-soft); color: var(--success); }
    .tier[data-tier='AutoChecked'], .tier[data-tier='Evidenced'] { background: var(--info-soft); color: var(--info); }
    .tier[data-tier='SelfReported'] { background: var(--warning-soft); color: var(--warning); }
    .cat-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; }
    .cat { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .cat-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; font-size: 0.88rem; }
    .cat-head strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .evidence-mini { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 0.74rem; color: var(--muted); }
    .req { padding: 12px 0; border-top: 1px solid var(--border); }
    .req:first-of-type { border-top: 0; }
    .req-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .actions { display: flex; flex-direction: column; gap: 4px; margin: 6px 0 0; padding: 0; list-style: none; font-size: 0.86rem; }
    .actions li { display: flex; gap: 6px; align-items: baseline; }
    .band { font-size: 0.72rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; background: var(--surface-3); }
    .band[data-band='foundation'] { background: var(--danger-soft); color: var(--danger); }
    .band[data-band='consolidate'] { background: var(--warning-soft); color: var(--warning); }
    .band[data-band='stretch'] { background: var(--success-soft); color: var(--success); }
    .tx { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; align-items: center; padding: 8px 0; border-top: 1px solid var(--border); font-size: 0.85rem; }
    .tx-points { font-weight: 750; font-variant-numeric: tabular-nums; }
    .tx-points[data-sign='neg'] { color: var(--danger); }
    .tx-points[data-sign='pos'] { color: var(--success); }
    .num { font-variant-numeric: tabular-nums; text-align: end; }
    @media (max-width: 760px) {
      .level-hero { grid-template-columns: 1fr; justify-items: start; }
      .ladder { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .cat-list { grid-template-columns: 1fr; }
    }
  `,
  template: `
    <app-page-header [title]="'devLevel.title' | t" [subtitle]="'devLevel.subtitle' | t" />

    @if (data.initialLoading()) {
      <div class="grid grid-2">@for (i of [1, 2, 3, 4]; track i) { <div class="card"><app-skeleton [rows]="4" /></div> }</div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as d) {
      <section class="card focus-card" aria-labelledby="lvl-h" data-tour="skills-level">
        <div class="level-hero">
          <app-progress-ring [value]="d.overall" [size]="132" [label]="'devLevel.overall' | t" />
          <div>
            <p class="eyebrow" id="lvl-h">{{ 'devLevel.currentLevel' | t }}</p>
            <p class="level-name" data-testid="level-name">{{ 'devLevel.levels.' + d.level | t }}</p>
            <p class="small muted">
              {{ 'devLevel.overallLine' | t: { score: (d.overall | fmtNum: 1) } }} ·
              {{ 'devLevel.xpLine' | t: { xp: (d.xp | fmtNum) } }}
            </p>
            @if (d.nextLevel) {
              <p class="label">{{ 'devLevel.progressTo' | t: { level: ('devLevel.levels.' + d.nextLevel | t) } }}</p>
              <app-progress-bar [value]="d.progressToNext" [label]="'devLevel.progressTo' | t: { level: ('devLevel.levels.' + d.nextLevel | t) }" />
              <p class="tiny muted">{{ d.progressToNext | fmtNum: 0 }}%</p>
            } @else {
              <p class="callout callout-success small"><app-icon name="award" /> {{ 'devLevel.topLevel' | t }}</p>
            }
          </div>
        </div>
        @if (d.xpAheadOfSkills) {
          <p class="callout callout-warn small" role="status">
            <app-icon name="alert" /> {{ 'devLevel.xpAhead' | t: { xpLevel: ('devLevel.levels.' + d.xpLevel | t), level: ('devLevel.levels.' + d.level | t) } }}
          </p>
        }
        <ol class="ladder" role="list" [attr.aria-label]="'devLevel.ladder' | t">
          @for (l of d.levels; track l.key) {
            <li class="rung" [attr.data-state]="l.index === d.levelIndex ? 'current' : l.index < d.levelIndex ? 'reached' : 'locked'">
              <strong>{{ 'devLevel.levels.' + l.key | t }}</strong>
              <span class="tiny muted">{{ 'devLevel.fromXp' | t: { xp: (l.minXp | fmtNum) } }}</span>
            </li>
          }
        </ol>
        <p class="tiny muted">
          <span class="tier" data-tier="QuizVerified">{{ 'devLevel.verifiedXp' | t: { xp: (d.stats.verifiedPoints | fmtNum) } }}</span>
          <span class="tier" data-tier="SelfReported">{{ 'devLevel.selfReportedXp' | t: { xp: (d.stats.selfReportedPoints | fmtNum) } }}</span>
        </p>
      </section>

      <section class="card" aria-labelledby="next-h" data-tour="skills-next">
        <h2 id="next-h" class="card-title"><app-icon name="target" />
          @if (d.nextLevel) { {{ 'devLevel.nextTitle' | t: { level: ('devLevel.levels.' + d.nextLevel | t) } }} } @else { {{ 'devLevel.nextTitleTop' | t }} }
        </h2>
        @if (d.nextLevelRequirements.length === 0) {
          <p class="muted">{{ 'devLevel.nothingMissing' | t }}</p>
        }
        @for (n of d.nextLevelRequirements; track $index) {
          <div class="req">
            <div class="req-head">
              <strong>{{ requirementText(n.requirement) }}</strong>
              <span class="small muted num">{{ n.requirement.current | fmtNum: 1 }} / {{ n.requirement.required | fmtNum: 1 }}</span>
            </div>
            <app-progress-bar [value]="pct(n.requirement)" [small]="true" tone="warning" [label]="requirementText(n.requirement)" />
            @if (n.actions.length) {
              <ul class="actions">
                @for (a of n.actions; track $index) {
                  <li><app-icon name="arrow-right" [size]="13" />
                    @if (link(a.ref); as l) { <a [routerLink]="l" [fragment]="fragment(a.ref)">{{ actionText(a) }}</a> } @else { <span>{{ actionText(a) }}</span> }
                  </li>
                }
              </ul>
            }
          </div>
        }
      </section>

      <section class="card" aria-labelledby="cat-h" data-tour="skills-categories">
        <h2 id="cat-h" class="card-title"><app-icon name="chart" /> {{ 'devLevel.categoriesTitle' | t }}</h2>
        <p class="small muted">{{ 'devLevel.categoriesIntro' | t }}</p>
        <div class="cat-list">
          @for (c of d.categories; track c.key) {
            <div class="cat">
              <div class="cat-head">
                <strong>{{ 'devLevel.categories.' + c.key | t }}</strong>
                <span class="small"><span class="num">{{ c.score | fmtNum: 1 }}</span> · {{ 'devLevel.proficiency.' + c.proficiency | t }}</span>
              </div>
              <app-progress-bar [value]="c.score" [small]="true" [tone]="tone(c.score)" [label]="'devLevel.categories.' + c.key | t" />
              <div class="evidence-mini">
                @for (e of shown(c.evidence); track e.kind) {
                  <span>{{ 'devLevel.evidence.' + e.kind | t }} {{ e.score | fmtNum: 0 }}</span>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <div class="grid grid-2">
        <section class="card" aria-labelledby="weak-h" data-tour="skills-weak">
          <h2 id="weak-h" class="card-title"><app-icon name="alert" /> {{ 'devLevel.weakTitle' | t }}</h2>
          @if (d.weakCategories.length === 0 && d.weakTopics.length === 0) {
            <p class="muted">{{ 'devLevel.noWeak' | t }}</p>
          } @else {
            @if (d.weakCategories.length) {
              <div class="chips">
                @for (w of d.weakCategories; track w) { <span class="chip chip-warn">{{ 'devLevel.categories.' + w | t }}</span> }
              </div>
            }
            @if (d.weakTopics.length) {
              <p class="label">{{ 'devLevel.weakTopics' | t }}</p>
              <ul class="mini-list" role="list">
                @for (w of d.weakTopics; track w.topicId) {
                  <li class="row-between"><a [routerLink]="['/topics', w.topicId]">{{ w | loc: 'title' }}</a>
                    <span class="small muted num">{{ 'devLevel.accuracyOf' | t: { pct: (w.accuracy | fmtNum: 0), n: w.answered } }}</span></li>
                }
              </ul>
            }
          }
        </section>

        <section class="card" aria-labelledby="chk-h" data-tour="skills-checks">
          <h2 id="chk-h" class="card-title"><app-icon name="flask" /> {{ 'devLevel.checksTitle' | t }}</h2>
          <p class="small muted">{{ 'devLevel.checksIntro' | t }}</p>
          <ul class="mini-list" role="list">
            @for (a of d.assessment.slice(0, showAllChecks() ? 99 : 5); track a.category) {
              <li class="stack">
                <div class="row-between">
                  <strong class="small">{{ 'devLevel.categories.' + a.category | t }}</strong>
                  <span class="row-gap">
                    @if (a.stale) { <span class="band">{{ 'devLevel.stale' | t }}</span> }
                    <span class="band" [attr.data-band]="a.band">{{ 'devLevel.bands.' + a.band | t }}</span>
                  </span>
                </div>
                <ul class="actions">
                  @for (c of a.checks; track $index) {
                    <li><app-icon name="arrow-right" [size]="13" />
                      @if (link(c.ref); as l) { <a [routerLink]="l" [fragment]="fragment(c.ref)">{{ actionText(c) }}</a> } @else { <span>{{ actionText(c) }}</span> }
                    </li>
                  }
                </ul>
              </li>
            }
          </ul>
          @if (d.assessment.length > 5) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="showAllChecks.set(!showAllChecks())">
              {{ (showAllChecks() ? 'devLevel.showFewer' : 'devLevel.showAll') | t }}
            </button>
          }
        </section>
      </div>

      <section class="card table-card" aria-labelledby="tech-h" data-tour="skills-profile">
        <h2 id="tech-h" class="card-title"><app-icon name="layers" /> {{ 'devLevel.profileTitle' | t }}</h2>
        <div class="table-scroll">
          <table class="table">
            <caption class="sr-only">{{ 'devLevel.profileTitle' | t }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ 'devLevel.cols.technology' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.knowledge' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.practical' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.project' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.overall' | t }}</th>
                <th scope="col">{{ 'devLevel.cols.level' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.points' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.topics' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.exercises' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.tasks' | t }}</th>
                <th scope="col" class="num">{{ 'devLevel.cols.accuracy' | t }}</th>
              </tr>
            </thead>
            <tbody>
              @for (t of d.technologies; track t.skill) {
                <tr>
                  <th scope="row">{{ 'skills.' + t.skill | t }}</th>
                  <td class="num">{{ kind(t.evidence, 'Knowledge') }}</td>
                  <td class="num">{{ kind(t.evidence, 'Practical') }}</td>
                  <td class="num">{{ kind(t.evidence, 'Project') }}</td>
                  <td class="num"><strong>{{ t.score | fmtNum: 0 }}</strong></td>
                  <td>{{ 'devLevel.proficiency.' + t.proficiency | t }}</td>
                  <td class="num">{{ t.points | fmtNum }}</td>
                  <td class="num">{{ t.topicsDone }} / {{ t.topicsTotal }}</td>
                  <td class="num">{{ t.exercisesDone }}</td>
                  <td class="num">{{ t.projectTasksDone }}</td>
                  <td class="num">{{ t.accuracy === null ? '—' : (t.accuracy | fmtNum: 0) + '%' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="stats-h">
        <h2 id="stats-h" class="section-title">{{ 'devLevel.statsTitle' | t }}</h2>
        <div class="grid grid-4 stat-cards">
          @for (s of statCards(); track s.key) {
            <div class="card stat-card"><span class="stat-label">{{ 'devLevel.stats.' + s.key | t }}</span><span class="stat-value">{{ s.value }}</span></div>
          }
        </div>
      </section>

      <div class="grid grid-2">
        <section class="card" aria-labelledby="tx-h" data-tour="skills-history">
          <h2 id="tx-h" class="card-title"><app-icon name="clock" /> {{ 'devLevel.historyTitle' | t }}</h2>
          @let rows = history() ?? d.recentTransactions;
          @if (rows.length === 0) { <p class="muted">{{ 'devLevel.noHistory' | t }}</p> }
          @for (x of rows; track x.id) {
            <div class="tx">
              <span class="small">{{ 'devLevel.activities.' + x.activity | t }}
                <span class="tier" [attr.data-tier]="x.verification">{{ 'devLevel.tiers.' + x.verification | t }}</span></span>
              <span class="tiny muted">{{ x.createdAt | fmtDate: 'short' }}</span>
              <span class="tx-points" [attr.data-sign]="x.points < 0 ? 'neg' : 'pos'">{{ signed(x) }}</span>
            </div>
          }
          @if (history() === null && d.recentTransactions.length > 0) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="loadHistory()">{{ 'devLevel.fullHistory' | t }}</button>
          } @else if (history() && hasMore()) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="loadHistory()">{{ 'devLevel.more' | t }}</button>
          }
        </section>

        <section class="card" aria-labelledby="how-h">
          <h2 id="how-h" class="card-title"><app-icon name="info" /> {{ 'devLevel.howTitle' | t }}</h2>
          <ul class="check-list small" role="list">
            @for (k of howKeys; track k) { <li><app-icon name="check" [size]="13" /> {{ 'devLevel.how.' + k | t }}</li> }
          </ul>
          @if (d.levelHistory.length) {
            <p class="label">{{ 'devLevel.levelHistory' | t }}</p>
            <ul class="mini-list" role="list">
              @for (h of d.levelHistory; track $index) {
                <li class="row-between small"><span>{{ 'devLevel.levels.' + h.level | t }}</span><span class="muted">{{ h.changedAt | fmtDate: 'medium' }}</span></li>
              }
            </ul>
          }
        </section>
      </div>
    }
  `,
})
export default class SkillLevelPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  protected readonly data = createLoader(() => this.api.skillLevel());
  protected readonly showAllChecks = signal(false);
  protected readonly history = signal<XpTransaction[] | null>(null);
  private readonly historyTotal = signal(0);
  private historyPage = 0;
  protected readonly hasMore = computed(() => (this.history()?.length ?? 0) < this.historyTotal());
  protected readonly howKeys = ['earnOnce', 'verification', 'weights', 'gates', 'ledger', 'rules'];

  protected readonly statCards = computed(() => {
    const s = this.data.value()?.stats;
    if (!s) return [];
    const n = (v: number, d = 0) => this.i18n.formatNumber(v, d);
    return [
      { key: 'videos', value: n(s.videosWatched) },
      { key: 'questions', value: `${n(s.correctAnswers)} / ${n(s.questionsAnswered)}` },
      { key: 'accuracy', value: s.accuracy === null ? '—' : `${n(s.accuracy)}%` },
      { key: 'topics', value: n(s.topicsCompleted) },
      { key: 'exercises', value: n(s.exercisesCompleted) },
      { key: 'tasks', value: n(s.projectTasksCompleted) },
      { key: 'projects', value: n(s.projectsCompleted) },
      { key: 'hours', value: n(s.learningHours, 1) },
      { key: 'mastered', value: n(s.technologiesMastered) },
    ];
  });

  protected tone(score: number): Tone { return score < 25 ? 'danger' : score < 50 ? 'warning' : score < 80 ? 'accent' : 'success'; }

  protected pct(r: SkillRequirement): number { return r.required <= 0 ? 100 : Math.min(100, (r.current / r.required) * 100); }

  /** Evidence kinds the category has content for (the others don't count towards it). */
  protected shown(evidence: EvidenceScore[]): EvidenceScore[] { return evidence.filter(e => e.maxPoints > 0); }

  protected kind(evidence: EvidenceScore[], kind: string): string {
    const e = evidence.find(x => x.kind === kind);
    return !e || e.maxPoints <= 0 ? '—' : this.i18n.formatNumber(e.score, 0);
  }

  protected requirementText(r: SkillRequirement): string {
    const category = r.category ? this.i18n.t(`devLevel.categories.${r.category}`) : '';
    return this.i18n.t(`devLevel.req.${r.code}`, { category });
  }

  protected actionText(a: SkillAction): string {
    return this.i18n.t(`devLevel.actions.${a.code}`, {
      title: this.i18n.pick(a.titleEn, a.titleAr), level: a.ref?.level ?? '', amount: a.amount === null ? '' : this.i18n.formatNumber(a.amount),
      category: a.category ? this.i18n.t(`devLevel.categories.${a.category}`) : '',
    });
  }

  protected link(ref: ItemRef | null): unknown[] | null {
    if (!ref) return null;
    switch (ref.type) {
      case 'topic': return ['/topics', ref.id];
      case 'exercise': return ['/practice', ref.id];
      case 'project': return ['/projects', ref.id];
      default: return null;
    }
  }

  /** Quiz recommendations open the topic at its quiz. */
  protected fragment(ref: ItemRef | null): string | undefined { return ref?.type === 'topic' && ref.level ? 'quiz' : undefined; }

  protected signed(x: XpTransaction): string { return `${x.points > 0 ? '+' : ''}${this.i18n.formatNumber(x.points)}`; }

  protected async loadHistory(): Promise<void> {
    try {
      const page = await this.api.xpHistory(this.historyPage + 1, 20);
      this.historyPage = page.page;
      this.historyTotal.set(page.total);
      this.history.update(h => [...(h ?? []), ...page.items]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }
}

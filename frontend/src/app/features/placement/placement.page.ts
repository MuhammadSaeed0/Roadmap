import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { PlacementPhaseResult, PlacementQuestion, PlacementQuiz, PlacementResult } from '../../core/models';
import { isolateLatin } from '../../shared/bidi';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

/** The phases the check covers (phases 1 to 8 of the roadmap). */
export const PLACEMENT_PHASES = 8;

type Step = 'intro' | 'questions' | 'result' | 'done';

/**
 * An optional placement check for new learners: two questions from each of the first phases, one at a time.
 * The result lists every phase; the learner ticks the ones to mark as already known and confirms.
 * Nothing on the roadmap changes before that confirmation.
 */
@Component({
  selector: 'app-placement-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, PageHeaderComponent, ProgressBarComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <app-page-header [title]="'placement.title' | t" />

    @switch (step()) {
      @case ('intro') {
        <section class="card pl-card" data-tour="placement-intro">
          <p>{{ 'placement.intro' | t: { phases: phaseCount } }}</p>
          <p class="callout callout-info"><app-icon name="info" /> <span>{{ 'placement.introSafe' | t }}</span></p>
          @if (error(); as err) { <app-error-state [error]="err" (retry)="start()" /> }
          <div class="row-gap">
            <button type="button" class="btn btn-primary" [disabled]="loading()" (click)="start()">
              @if (loading()) { <app-icon name="refresh" class="spin" [size]="14" /> } {{ 'placement.start' | t }}
            </button>
            <a class="btn btn-ghost" routerLink="/">{{ 'placement.notNow' | t }}</a>
          </div>
        </section>
      }
      @case ('questions') {
        @if (current(); as q) {
          <section class="card pl-card" data-tour="placement-questions">
            @if (changedNote()) { <p class="callout callout-info" role="status"><app-icon name="info" /> <span>{{ 'placement.changed' | t }}</span></p> }
            <p class="small muted" aria-live="polite">{{ 'placement.questionOf' | t: { n: index() + 1, total: total() } }}</p>
            <app-progress-bar [value]="(index() + 1) / total() * 100" [small]="true" [label]="'placement.questionOf' | t: { n: index() + 1, total: total() }" />
            <div class="quiz-question pl-question">
              <fieldset [disabled]="busy()">
                <legend><span class="quiz-q" [innerHTML]="bidi(q | loc: 'question')"></span></legend>
                <div class="quiz-options">
                  @for (o of orderOf(q); track o) {
                    <label class="quiz-option" [class.chosen]="answers()[q.id] === o">
                      <input type="radio" [name]="'pl-' + q.id" [value]="o" [checked]="answers()[q.id] === o" (change)="choose(q.id, o)" />
                      <span [innerHTML]="bidi(options(q)[o])"></span>
                    </label>
                  }
                </div>
              </fieldset>
            </div>
            @if (gradeError(); as err) {
              <div class="callout callout-warn" role="alert">
                <app-icon name="alert" /> <span>{{ 'placement.gradeFailed' | t }} <span class="muted small">{{ errorText(err) }}</span></span>
              </div>
            }
            <div class="row-gap pl-nav">
              <button type="button" class="btn btn-secondary" [disabled]="index() === 0 || busy()" (click)="move(-1)">{{ 'placement.back' | t }}</button>
              @if (index() < total() - 1) {
                <button type="button" class="btn btn-primary" [disabled]="answers()[q.id] === undefined" (click)="move(1)">{{ 'placement.next' | t }}</button>
              } @else {
                <button type="button" class="btn btn-primary" [disabled]="!allAnswered() || busy()" (click)="grade()">
                  @if (busy()) { <app-icon name="refresh" class="spin" [size]="14" /> } {{ (gradeError() ? 'placement.resend' : 'placement.finish') | t }}
                </button>
              }
            </div>
          </section>
        } @else {
          <div class="card"><app-skeleton [rows]="5" /></div>
        }
      }
      @case ('result') {
        @if (result(); as r) {
          <section class="card pl-card" data-tour="placement-result" aria-labelledby="pl-result-h">
            <h2 id="pl-result-h" class="section-title">{{ 'placement.resultTitle' | t }}</h2>
            <p class="muted">{{ 'placement.resultIntro' | t }}</p>
            @if (anyKnown()) {
              <button type="button" class="btn btn-secondary btn-sm" (click)="selectKnown()">
                <app-icon name="check-circle" [size]="14" /> {{ 'placement.selectKnown' | t }}
              </button>
            }
            <ul class="pl-phases" role="list">
              @for (p of r.phases; track p.phaseId) {
                <li class="pl-phase" [class.known]="p.known" [class.ticked]="ticked().has(p.phaseId)">
                  <label class="checkbox">
                    <input type="checkbox" [checked]="ticked().has(p.phaseId)" (change)="toggle(p.phaseId)" [disabled]="busy()" />
                    <span class="pl-phase-text">
                      <strong class="pl-phase-title"><span class="pl-order">{{ p.order }}.</span> <span [innerHTML]="bidi(p | loc: 'title')"></span></strong>
                      <span class="small muted">{{ 'placement.score' | t: { correct: p.correct, total: p.total } }} · {{ 'placement.topics' | t: { n: p.topicCount } }}</span>
                    </span>
                  </label>
                  <span class="pl-verdict small" [class.is-known]="p.known">
                    <app-icon [name]="p.known ? 'check-circle' : 'book'" [size]="14" /> {{ (p.known ? 'placement.known' : 'placement.notYet') | t }}
                  </span>
                </li>
              }
            </ul>
            @if (applyError(); as err) {
              <div class="callout callout-warn" role="alert"><app-icon name="alert" /> <span>{{ 'placement.applyFailed' | t }} <span class="muted small">{{ errorText(err) }}</span></span></div>
            }
            <div class="row-gap">
              <button type="button" class="btn btn-primary" [disabled]="ticked().size === 0 || busy()" (click)="apply()">
                @if (busy()) { <app-icon name="refresh" class="spin" [size]="14" /> } {{ 'placement.apply' | t: { n: ticked().size } }}
              </button>
              <a class="btn btn-ghost" routerLink="/roadmap">{{ 'placement.skip' | t }}</a>
            </div>
            @if (ticked().size === 0) { <p class="small muted">{{ 'placement.chooseFirst' | t }}</p> }
          </section>
        }
      }
      @case ('done') {
        <section class="card pl-card" role="status" aria-live="polite">
          <h2 class="section-title"><app-icon name="check-circle" /> {{ 'placement.doneTitle' | t }}</h2>
          <p>{{ 'placement.done' | t: { n: marked() } }}</p>
          <div class="row-gap">
            <a class="btn btn-primary" routerLink="/roadmap">{{ 'placement.openRoadmap' | t }}</a>
            <a class="btn btn-secondary" routerLink="/">{{ 'placement.toDashboard' | t }}</a>
          </div>
        </section>
      }
    }
  `,
  styles: `
    .pl-card { display: grid; gap: 16px; max-width: 760px; }
    .pl-card > p { margin: 0; }
    .pl-question fieldset { padding: 16px; }
    .pl-nav { justify-content: space-between; }
    .pl-phases { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .pl-phase { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;
      padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; }
    .pl-phase.ticked { border-color: var(--accent); background: var(--accent-soft); }
    .pl-phase .checkbox { flex: 1 1 260px; min-width: 0; }
    .pl-phase-text { display: grid; gap: 2px; min-width: 0; }
    .pl-phase-title { display: flex; gap: 6px; }
    .pl-verdict { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); }
    .pl-verdict.is-known { color: var(--success); font-weight: 600; }
  `,
})
export default class PlacementPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);

  protected readonly phaseCount = PLACEMENT_PHASES;
  protected readonly step = signal<Step>('intro');
  protected readonly quiz = signal<PlacementQuiz | null>(null);
  protected readonly index = signal(0);
  protected readonly answers = signal<Record<number, number>>({});
  protected readonly result = signal<PlacementResult | null>(null);
  protected readonly ticked = signal<ReadonlySet<number>>(new Set());
  protected readonly marked = signal(0);
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly gradeError = signal<ApiError | null>(null);
  protected readonly applyError = signal<ApiError | null>(null);
  protected readonly changedNote = signal(false);
  /** The order each question's options are shown in (indexes into the option list), shuffled per check. */
  private readonly optionOrder = signal<Record<number, number[]>>({});

  protected readonly total = computed(() => this.quiz()?.questions.length ?? 0);
  protected readonly current = computed(() => this.quiz()?.questions[this.index()] ?? null);
  protected readonly allAnswered = computed(() => {
    const q = this.quiz();
    return !!q && q.questions.every(x => this.answers()[x.id] !== undefined);
  });
  protected readonly anyKnown = computed(() => this.result()?.phases.some(p => p.known) ?? false);

  protected bidi(text: string | null | undefined): string { return isolateLatin(text, this.i18n.lang()); }
  protected options(q: PlacementQuestion): string[] { return this.i18n.lang() === 'ar' ? q.optionsAr : q.optionsEn; }
  protected orderOf(q: PlacementQuestion): number[] { return this.optionOrder()[q.id] ?? q.optionsEn.map((_, i) => i); }
  protected errorText(error: ApiError): string { return this.i18n.errorMessage(error); }

  protected async start(changed = false): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.gradeError.set(null);
    try {
      const quiz = await this.api.placement();
      this.optionOrder.set(Object.fromEntries(quiz.questions.map(q => [q.id, shuffled(q.optionsEn.map((_, i) => i))])));
      this.quiz.set(quiz);
      this.answers.set({});
      this.index.set(0);
      this.changedNote.set(changed);
      this.step.set('questions');
    } catch (e) {
      this.error.set(ApiError.from(e));
      this.step.set('intro');
    } finally {
      this.loading.set(false);
    }
  }

  protected choose(questionId: number, option: number): void {
    this.answers.update(a => ({ ...a, [questionId]: option }));
  }

  protected move(by: number): void {
    this.index.update(i => Math.min(Math.max(0, i + by), this.total() - 1));
  }

  protected async grade(): Promise<void> {
    const quiz = this.quiz();
    if (!quiz || !this.allAnswered()) return;
    this.busy.set(true);
    this.gradeError.set(null);
    try {
      const result = await this.api.gradePlacement(quiz.questions.map(q => ({ questionId: q.id, choice: this.answers()[q.id] })));
      this.result.set(result);
      this.ticked.set(new Set());
      this.step.set('result');
    } catch (e) {
      const err = ApiError.from(e);
      // The questions changed on the server while the check was open: start again with a fresh set.
      if (err.code === 'placement_invalid_answers') { this.busy.set(false); await this.start(true); return; }
      this.gradeError.set(err);
    } finally {
      this.busy.set(false);
    }
  }

  protected toggle(phaseId: number): void {
    this.ticked.update(set => {
      const next = new Set(set);
      if (!next.delete(phaseId)) next.add(phaseId);
      return next;
    });
  }

  /** Ticks the phases the learner got fully right. Still only a selection: nothing is marked until they confirm. */
  protected selectKnown(): void {
    const known = (this.result()?.phases ?? []).filter((p: PlacementPhaseResult) => p.known).map(p => p.phaseId);
    this.ticked.update(set => new Set([...set, ...known]));
  }

  protected async apply(): Promise<void> {
    const ids = [...this.ticked()];
    if (ids.length === 0) return;
    this.busy.set(true);
    this.applyError.set(null);
    try {
      const applied = await this.api.applyPlacement(ids);
      this.marked.set(applied.topicsMarked);
      this.step.set('done');
    } catch (e) {
      this.applyError.set(ApiError.from(e));
    } finally {
      this.busy.set(false);
    }
  }
}

function shuffled<T>(items: T[]): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

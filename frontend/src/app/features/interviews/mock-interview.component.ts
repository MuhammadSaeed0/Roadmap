import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Difficulty, InterviewCategory, InterviewQuestion, InterviewRating } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent } from '../../shared/ui.components';

type Stage = 'setup' | 'running' | 'done';
interface Answered { question: InterviewQuestion; rating: InterviewRating | null; seconds: number; timedOut: boolean; hinted: boolean; }
export type MockLevel = 'junior' | 'mid' | 'senior';
type RubricItem = 'mainIdea' | 'example' | 'tradeoffs' | 'mistake';

/** The difficulties each interview level draws from. */
const LEVEL_DIFFICULTIES: Record<MockLevel, Difficulty[]> = {
  junior: ['Beginner', 'Intermediate'],
  mid: ['Beginner', 'Intermediate', 'Advanced'],
  senior: ['Intermediate', 'Advanced', 'Expert'],
};

/** Questions that fit the level; the whole pool when the level leaves fewer than `minimum`. */
export function poolForLevel(pool: InterviewQuestion[], level: MockLevel, minimum: number): InterviewQuestion[] {
  const fit = pool.filter(q => LEVEL_DIFFICULTIES[level].includes(q.difficulty));
  return fit.length >= minimum ? fit : pool;
}

export interface AnswerParts { body: string; keyConcepts: string | null; mistake: string | null; }

const KEY_MARKERS = ['Key concepts:', 'والمفاهيم الأساسية:', 'المفاهيم الأساسية:'];
const MISTAKE_MARKERS = ['Common mistake:', 'والخطأ الشائع:', 'الخطأ الشائع:'];

/** Splits the "Key concepts: …" and "Common mistake: …" sentences out of a model answer. */
export function splitAnswer(text: string): AnswerParts {
  let body = text;
  const take = (markers: string[]): string | null => {
    for (const m of markers) {
      const i = body.indexOf(m);
      if (i < 0) continue;
      const rest = body.slice(i + m.length);
      const end = rest.search(/\.(\s|$)/);
      const sentence = (end < 0 ? rest : rest.slice(0, end + 1)).trim();
      body = (body.slice(0, i) + (end < 0 ? '' : rest.slice(end + 1))).replace(/\s{2,}/g, ' ').trim();
      return sentence || null;
    }
    return null;
  };
  const keyConcepts = take(KEY_MARKERS);
  const mistake = take(MISTAKE_MARKERS);
  return { body, keyConcepts, mistake };
}

/** The rating the rubric points to: every box ticked is Confident, at least half is Partial. A hint caps it at Partial. */
export function suggestedRating(checked: number, total: number, hinted: boolean): InterviewRating {
  const r: InterviewRating = total > 0 && checked >= total ? 'Confident' : checked > 0 && checked * 2 >= total ? 'Partial' : 'NeedReview';
  return hinted && r === 'Confident' ? 'Partial' : r;
}

export interface WeakTopic { topicId: number; topicTitleEn: string; topicTitleAr: string; count: number; }

/** Roadmap topics behind the answers that weren't confident, most questions first. */
export function weakTopics(answered: { question: InterviewQuestion; rating: InterviewRating | null }[]): WeakTopic[] {
  const map = new Map<number, WeakTopic>();
  for (const a of answered) {
    if (a.rating === 'Confident') continue;
    const q = a.question;
    const t = map.get(q.topicId) ?? { topicId: q.topicId, topicTitleEn: q.topicTitleEn, topicTitleAr: q.topicTitleAr, count: 0 };
    t.count++;
    map.set(q.topicId, t);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.topicTitleEn.localeCompare(b.topicTitleEn));
}

/**
 * Picks questions from several categories in turn (shuffled, so each run differs). Every category the pool has is
 * used before any repeats, so a ten-question interview mixes C#, ASP.NET Core, SQL, Angular and so on.
 */
export function pickMockQuestions(pool: InterviewQuestion[], categories: InterviewCategory[], count: number, random = Math.random): InterviewQuestion[] {
  const shuffle = <T,>(items: T[]) => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const queues = shuffle(categories)
    .map(c => shuffle(pool.filter(q => q.category === c)))
    .filter(q => q.length > 0);
  const picked: InterviewQuestion[] = [];
  while (picked.length < count && queues.some(q => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) picked.push(next);
      if (picked.length === count) break;
    }
  }
  return picked;
}

/**
 * Mock interview: a timed run through questions from several categories at a chosen level. Each question has a
 * countdown and an optional hint; when time runs out the expected answer opens with its key concepts, common mistake
 * and the interviewer's follow-up. A short rubric suggests a rating, the learner rates (saved like any rating), and the
 * summary shows a score and the roadmap topics to review. No AI is involved; an interviewer model could later replace
 * the self-check without changing this flow.
 */
@Component({
  selector: 'app-mock-interview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, CodeBlockComponent, ProgressBarComponent, RouterLink],
  template: `
    @switch (stage()) {
      @case ('setup') {
        <section class="card mock-setup" aria-labelledby="mock-h">
          <h2 id="mock-h" class="card-title"><app-icon name="clock" /> {{ 'interviews.mock.title' | t }}</h2>
          <p class="muted">{{ 'interviews.mock.intro' | t }}</p>

          <fieldset class="mock-field">
            <legend>{{ 'interviews.mock.level' | t }}</legend>
            <div class="segmented" role="radiogroup">
              @for (l of levels; track l) {
                <button type="button" role="radio" [attr.aria-checked]="level() === l" [class.active]="level() === l" (click)="level.set(l)">{{ 'interviews.mock.levels.' + l | t }}</button>
              }
            </div>
          </fieldset>
          <fieldset class="mock-field">
            <legend>{{ 'interviews.mock.howMany' | t }}</legend>
            <div class="segmented" role="radiogroup">
              @for (n of counts; track n) {
                <button type="button" role="radio" [attr.aria-checked]="count() === n" [class.active]="count() === n" (click)="count.set(n)">{{ n }}</button>
              }
            </div>
          </fieldset>
          <fieldset class="mock-field">
            <legend>{{ 'interviews.mock.perQuestion' | t }}</legend>
            <div class="segmented" role="radiogroup">
              @for (m of minuteOptions; track m) {
                <button type="button" role="radio" [attr.aria-checked]="minutes() === m" [class.active]="minutes() === m" (click)="minutes.set(m)">
                  {{ 'interviews.mock.minutes' | t: { n: m } }}</button>
              }
            </div>
          </fieldset>
          <fieldset class="mock-field">
            <legend>{{ 'interviews.mock.categories' | t }}</legend>
            <div class="mock-cats">
              @for (c of available(); track c) {
                <label class="check-label small"><input type="checkbox" [checked]="chosen().has(c)" (change)="toggleCategory(c)" />
                  {{ 'interviewCategory.' + c | t }}</label>
              }
            </div>
          </fieldset>
          <button type="button" class="btn btn-primary mock-start" [disabled]="chosen().size === 0" (click)="start()">
            <app-icon name="play" [size]="15" /> {{ 'interviews.mock.start' | t }}
          </button>
        </section>
      }
      @case ('running') {
        @if (current(); as q) {
          <section class="card practice-card mock-run" aria-labelledby="mock-q">
            <div class="card-head">
              <span class="small muted">{{ 'interviews.questionOf' | t: { n: index() + 1, total: questions().length } }}</span>
              <span class="mock-timer" [class.low]="remaining() <= 15" role="timer" [attr.aria-label]="'interviews.mock.timeLeft' | t">{{ clock() }}</span>
            </div>
            <app-progress-bar [value]="(index() / questions().length) * 100" [small]="true" [label]="'interviews.questionOf' | t: { n: index() + 1, total: questions().length }" />
            <span class="chips"><span class="chip chip-sm">{{ 'interviewCategory.' + q.category | t }}</span>
              <span class="chip chip-sm chip-ghost">{{ 'difficulty.' + q.difficulty | t }}</span></span>
            <h2 id="mock-q" class="practice-q">{{ q | loc: 'question' }}</h2>

            @if (!revealed()) {
              <p class="muted"><app-icon name="bulb" [size]="15" /> {{ 'interviews.thinkFirst' | t }}</p>
              @if (hinted()) {
                <p class="callout mock-hint"><strong>{{ 'interviews.mock.hintLabel' | t }}</strong>
                  {{ parts()?.keyConcepts ?? ('interviews.mock.hintTopic' | t: { topic: (q | loc: 'topicTitle') }) }}</p>
              }
              <div class="row-gap">
                <button type="button" class="btn btn-primary" (click)="showAnswer(false)"><app-icon name="eye" [size]="15" /> {{ 'interviews.mock.done' | t }}</button>
                @if (!hinted()) {
                  <button type="button" class="btn btn-ghost" (click)="hinted.set(true)"><app-icon name="bulb" [size]="15" /> {{ 'interviews.mock.hint' | t }}</button>
                }
              </div>
            } @else {
              @if (timedOut()) { <p class="callout callout-warn"><app-icon name="clock" [size]="15" /> {{ 'interviews.mock.timeUp' | t }}</p> }
              @if (parts(); as p) {
                <div class="answer-box">
                  <p class="prose">{{ p.body }}</p>
                  @if (p.keyConcepts) { <p class="small"><strong>{{ 'interviews.mock.keyConcepts' | t }}</strong> {{ p.keyConcepts }}</p> }
                  @if (p.mistake) { <p class="small mock-mistake"><strong>{{ 'interviews.mock.mistake' | t }}</strong> {{ p.mistake }}</p> }
                  @if (q.exampleCode) { <app-code-block [code]="q.exampleCode" /> }
                </div>
              }
              <fieldset class="mock-field mock-rubric">
                <legend>{{ 'interviews.mock.rubric' | t }}</legend>
                @for (item of rubric(); track item) {
                  <label class="check-label small"><input type="checkbox" [checked]="checked().has(item)" (change)="toggleCheck(item)" />
                    {{ 'interviews.mock.rubricItems.' + item | t }}</label>
                }
              </fieldset>
              @if (q | loc: 'followUp'; as follow) {
                <div class="callout mock-follow">
                  <p class="small"><strong>{{ 'interviews.mock.followUpLead' | t }}</strong></p>
                  <p>{{ follow }}</p>
                  <p class="small muted">{{ 'interviews.mock.followUpHint' | t }}</p>
                </div>
              }
              <p class="label">{{ 'interviews.rateYourself' | t }}</p>
              <div class="rate-group big" role="group" [attr.aria-label]="'interviews.rateYourself' | t">
                @for (r of ratings; track r) {
                  <button type="button" class="btn rate-btn" [class.suggested]="suggested() === r" [attr.data-rating]="r" [disabled]="busy()" (click)="rate(r)">
                    {{ 'rating.' + r | t }}</button>
                }
              </div>
              <p class="small muted mock-suggested">{{ 'interviews.mock.suggested' | t: { rating: ('rating.' + suggested() | t) } }}</p>
            }
            <div class="row-gap practice-nav">
              <button type="button" class="btn btn-ghost btn-sm" (click)="finish()">{{ 'interviews.mock.end' | t }}</button>
            </div>
          </section>
        }
      }
      @case ('done') {
        <section class="card mock-summary" aria-labelledby="mock-sum-h">
          <h2 id="mock-sum-h" class="card-title"><app-icon name="award" /> {{ 'interviews.mock.summary' | t }}</h2>
          <dl class="stat-row">
            @for (r of ratings; track r) {
              <div><dt>{{ 'rating.' + r | t }}</dt><dd>{{ tally()[r] }}</dd></div>
            }
            <div><dt>{{ 'interviews.mock.totalTime' | t }}</dt><dd>{{ totalClock() }}</dd></div>
            <div><dt>{{ 'interviews.mock.score' | t }}</dt><dd>{{ score() }}%</dd></div>
            <div><dt>{{ 'interviews.mock.hintsUsed' | t }}</dt><dd>{{ hintsUsed() }}</dd></div>
          </dl>
          <section class="mock-weak" aria-labelledby="mock-weak-h">
            <h3 id="mock-weak-h">{{ 'interviews.mock.weakTitle' | t }}</h3>
            @if (weak().length) {
              <p class="small muted">{{ 'interviews.mock.weakHint' | t }}</p>
              <ul role="list">
                @for (w of weak(); track w.topicId) {
                  <li><a [routerLink]="['/topics', w.topicId]">{{ w | loc: 'topicTitle' }}</a>
                    <span class="small muted">{{ 'interviews.mock.weakCount' | t: { n: w.count } }}</span></li>
                }
              </ul>
            } @else {
              <p class="small muted">{{ 'interviews.mock.weakNone' | t }}</p>
            }
          </section>
          <ol class="mock-results" role="list">
            @for (a of answered(); track a.question.id) {
              <li>
                <span class="chip chip-sm" [attr.data-rating]="a.rating">{{ a.rating ? ('rating.' + a.rating | t) : ('interviews.mock.skipped' | t) }}</span>
                <span class="mock-result-q">{{ a.question | loc: 'question' }}</span>
                <span class="muted small">{{ seconds(a.seconds) }}@if (a.timedOut) { · {{ 'interviews.mock.overTime' | t }} }@if (a.hinted) { · {{ 'interviews.mock.hintUsed' | t }} }</span>
              </li>
            }
          </ol>
          <div class="row-gap">
            <button type="button" class="btn btn-primary" (click)="start()"><app-icon name="refresh" [size]="15" /> {{ 'interviews.mock.again' | t }}</button>
            <button type="button" class="btn btn-secondary" (click)="stage.set('setup')">{{ 'interviews.mock.change' | t }}</button>
          </div>
        </section>
      }
    }
  `,
  styles: `
    .mock-field { border: 0; padding: 0; margin: 16px 0 0; }
    .mock-field legend { font-weight: 500; margin-bottom: 8px; padding: 0; }
    .mock-cats { display: flex; flex-wrap: wrap; gap: 8px 16px; }
    .mock-start { margin-top: 20px; }
    .mock-timer { font-variant-numeric: tabular-nums; font-weight: 600; font-size: 1.1rem; padding: 2px 10px; border-radius: 999px; background: var(--surface-2); }
    .mock-timer.low { background: var(--warning-soft); color: var(--warning); }
    .mock-results { list-style: none; margin: 16px 0; padding: 0; display: grid; gap: 10px; }
    .mock-results li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: baseline; }
    .mock-result-q { min-width: 0; }
    .mock-hint, .mock-follow { margin: 12px 0; }
    .mock-hint strong, .mock-follow strong { margin-inline-end: 6px; }
    .mock-rubric { display: grid; gap: 6px; }
    .mock-mistake strong { color: var(--warning); }
    .rate-btn.suggested { outline: 2px solid var(--accent); outline-offset: 2px; }
    .mock-weak { margin-top: 16px; }
    .mock-weak h3 { font-size: 1rem; margin: 0 0 4px; }
    .mock-weak ul { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 6px; }
    .mock-weak li { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
    @media (max-width: 560px) { .mock-results li { grid-template-columns: minmax(0, 1fr); gap: 4px; } }
  `,
})
export class MockInterviewComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  /** Every question (all categories). */
  readonly pool = input.required<InterviewQuestion[]>();
  /** A rating was saved: the page updates its own copy of the question. */
  readonly rated = output<InterviewQuestion>();

  protected readonly counts = [5, 10, 15];
  protected readonly minuteOptions = [2, 3, 5];
  protected readonly ratings: InterviewRating[] = ['NeedReview', 'Partial', 'Confident'];

  protected readonly levels: MockLevel[] = ['junior', 'mid', 'senior'];
  protected readonly level = signal<MockLevel>('mid');
  protected readonly stage = signal<Stage>('setup');
  protected readonly count = signal(10);
  protected readonly minutes = signal(3);
  protected readonly available = computed(() => [...new Set(this.pool().map(q => q.category))]);
  private readonly unchecked = signal(new Set<InterviewCategory>());
  protected readonly chosen = computed(() => new Set(this.available().filter(c => !this.unchecked().has(c))));

  protected readonly questions = signal<InterviewQuestion[]>([]);
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly remaining = signal(0);
  protected readonly revealed = signal(false);
  protected readonly timedOut = signal(false);
  protected readonly busy = signal(false);
  protected readonly hinted = signal(false);
  protected readonly checked = signal(new Set<RubricItem>());
  protected readonly parts = computed(() => {
    const q = this.current();
    return q ? splitAnswer(this.i18n.loc(q, 'answer')) : null;
  });
  protected readonly rubric = computed<RubricItem[]>(() =>
    this.parts()?.mistake ? ['mainIdea', 'example', 'tradeoffs', 'mistake'] : ['mainIdea', 'example', 'tradeoffs']);
  protected readonly suggested = computed(() => suggestedRating(this.checked().size, this.rubric().length, this.hinted()));
  protected readonly answered = signal<Answered[]>([]);
  private startedAt = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly clock = computed(() => this.seconds(this.remaining()));
  protected readonly tally = computed(() => {
    const t: Record<InterviewRating, number> = { NeedReview: 0, Partial: 0, Confident: 0 };
    for (const a of this.answered()) if (a.rating) t[a.rating]++;
    return t;
  });
  protected readonly score = computed(() => {
    const a = this.answered();
    if (a.length === 0) return 0;
    const points = a.reduce((s, x) => s + (x.rating === 'Confident' ? 2 : x.rating === 'Partial' ? 1 : 0), 0);
    return Math.round((points / (a.length * 2)) * 100);
  });
  protected readonly hintsUsed = computed(() => this.answered().filter(a => a.hinted).length);
  protected readonly weak = computed(() => weakTopics(this.answered()));
  protected readonly totalClock = computed(() => this.seconds(this.answered().reduce((s, a) => s + a.seconds, 0)));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected toggleCategory(c: InterviewCategory): void {
    this.unchecked.update(s => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  }

  protected toggleCheck(item: RubricItem): void {
    this.checked.update(s => { const n = new Set(s); if (n.has(item)) n.delete(item); else n.add(item); return n; });
  }

  protected start(): void {
    const pool = poolForLevel(this.pool().filter(q => this.chosen().has(q.category)), this.level(), this.count());
    const picked = pickMockQuestions(pool, [...this.chosen()], this.count());
    if (picked.length === 0) return;
    this.questions.set(picked);
    this.answered.set([]);
    this.index.set(0);
    this.stage.set('running');
    this.beginQuestion();
  }

  protected showAnswer(timedOut: boolean): void {
    this.stop();
    this.timedOut.set(timedOut);
    this.revealed.set(true);
  }

  protected async rate(rating: InterviewRating): Promise<void> {
    const q = this.current();
    if (!q) return;
    this.busy.set(true);
    try {
      this.rated.emit(await this.api.rateQuestion(q.id, rating));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
      return;
    } finally {
      this.busy.set(false);
    }
    this.record(rating);
    if (this.index() + 1 >= this.questions().length) { this.stage.set('done'); return; }
    this.index.update(i => i + 1);
    this.beginQuestion();
  }

  /** Ends early: the current question counts as skipped unless it was already rated. */
  protected finish(): void {
    this.stop();
    if (this.current() && this.answered().length === this.index()) this.record(null);
    this.stage.set('done');
  }

  protected seconds(total: number): string {
    const m = Math.floor(total / 60), s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  private beginQuestion(): void {
    this.stop();
    this.revealed.set(false);
    this.timedOut.set(false);
    this.hinted.set(false);
    this.checked.set(new Set());
    this.remaining.set(this.minutes() * 60);
    this.startedAt = Date.now();
    this.timer = setInterval(() => {
      this.remaining.update(r => Math.max(0, r - 1));
      if (this.remaining() === 0) this.showAnswer(true);
    }, 1000);
  }

  private record(rating: InterviewRating | null): void {
    const q = this.current();
    if (!q) return;
    const seconds = Math.min(Math.round((Date.now() - this.startedAt) / 1000), 24 * 3600);
    this.answered.update(a => [...a, { question: q, rating, seconds, timedOut: this.timedOut(), hinted: this.hinted() }]);
  }

  private stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}

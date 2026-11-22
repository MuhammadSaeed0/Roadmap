import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Quiz, QuizLevel, QuizLevelInfo, QuizQuestion, QuizResult, QuizResultItem } from '../../core/models';
import { isolateLatin } from '../../shared/bidi';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * A short quiz under the topic videos, in three levels that open one after another:
 * this topic, this topic mixed with the topics before it, and a wider review.
 * The API sends questions without answers and grades the submission.
 */
/** A run of text without Arabic letters (Arabic punctuation such as ، and ؟ is in the Arabic block too). */
@Component({
  selector: 'app-topic-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, SkeletonComponent, ErrorStateComponent],
  template: `
    <section class="card content-section quiz" id="quiz" aria-labelledby="quiz-h" data-tour="topic-quiz">
      <div class="card-head">
        <h2 id="quiz-h" class="section-title"><app-icon name="target" /> {{ 'quiz.title' | t }}</h2>
      </div>
      <p class="muted small">{{ 'quiz.intro' | t: { pct: passPercent() } }}</p>

      @if (levels().length) {
        <div class="quiz-levels" role="tablist" [attr.aria-label]="'quiz.title' | t">
          @for (l of levels(); track l.level) {
            <button type="button" role="tab" class="quiz-level" [class.active]="level() === l.level" [attr.aria-selected]="level() === l.level"
                    [class.passed]="l.passed" [disabled]="!l.available || !l.unlocked || busy()" (click)="open(l.level)"
                    [title]="(!l.available ? 'quiz.unavailable' : !l.unlocked ? 'quiz.locked' : 'quiz.level' + l.level + 'Hint') | t">
              <span class="quiz-level-name">
                <app-icon [name]="l.passed ? 'check-circle' : (!l.available || !l.unlocked) ? 'lock' : 'target'" [size]="14" />
                {{ l.level }}. {{ 'quiz.level' + l.level | t }}
              </span>
              <span class="tiny muted">
                @if (!l.available) { {{ 'quiz.unavailable' | t }} }
                @else if (!l.unlocked) { {{ 'quiz.locked' | t }} }
                @else if (l.bestTotal) { {{ 'quiz.best' | t: { score: l.bestScore, total: l.bestTotal } }} }
                @else { {{ 'quiz.notTried' | t }} }
              </span>
            </button>
          }
        </div>
      }

      @if (loading() && !quiz()) {
        <app-skeleton [rows]="4" [height]="20" />
      } @else if (error(); as err) {
        <app-error-state [error]="err" (retry)="open(level())" />
      } @else if (quiz(); as q) {
        <p class="muted small">{{ 'quiz.level' + q.level + 'Hint' | t }}</p>
        <ol class="quiz-questions" role="list">
          @for (question of q.questions; track question.id; let i = $index) {
            <li class="quiz-question" [attr.data-result]="resultFor(question.id) ? (resultFor(question.id)!.isCorrect ? 'correct' : 'wrong') : null">
              <fieldset [disabled]="!!result() || busy()">
                <legend>
                  <span class="tiny muted">{{ 'quiz.questionOf' | t: { n: i + 1, total: q.questions.length } }}
                    @if (question.topicId !== topicId()) { · <span [innerHTML]="bidi('quiz.fromTopic' | t: { title: (question | loc: 'topicTitle') })"></span> }
                  </span>
                  <span class="quiz-q" [innerHTML]="bidi(question | loc: 'question')"></span>
                </legend>
                <div class="quiz-options">
                  @for (o of orderOf(question); track o) {
                    @let option = options(question)[o];
                    <label class="quiz-option" [class.chosen]="answers()[question.id] === o"
                           [class.is-correct]="resultFor(question.id)?.correctIndex === o"
                           [class.is-wrong]="resultFor(question.id) && answers()[question.id] === o && !resultFor(question.id)!.isCorrect">
                      <input type="radio" [name]="'q-' + question.id" [value]="o" [checked]="answers()[question.id] === o" (change)="choose(question.id, o)" />
                      <span [innerHTML]="bidi(option)"></span>
                    </label>
                  }
                </div>
                @if (resultFor(question.id); as r) {
                  <p class="quiz-feedback" role="status">
                    <app-icon [name]="r.isCorrect ? 'check-circle' : 'x'" [size]="15" />
                    <strong>{{ (r.isCorrect ? 'quiz.correct' : 'quiz.wrong') | t }}.</strong>
                    @if (!r.isCorrect) { <span [innerHTML]="bidi('quiz.correctAnswer' | t: { answer: options(question)[r.correctIndex] })"></span> }
                    <span class="muted" [innerHTML]="bidi(r | loc: 'explanation')"></span>
                  </p>
                }
              </fieldset>
            </li>
          }
        </ol>

        @if (result(); as r) {
          <div class="callout" [class.callout-info]="r.passed" [class.callout-warn]="!r.passed" role="status" aria-live="polite">
            <app-icon [name]="r.passed ? 'award' : 'alert'" />
            <span><strong>{{ 'quiz.scored' | t: { score: r.score, total: r.total } }}</strong>
              {{ (r.passed ? (nextLevel() ? 'quiz.passed' : 'quiz.allDone') : 'quiz.failed') | t }}</span>
          </div>
          <div class="row-gap">
            @if (r.passed && nextLevel(); as next) {
              <button type="button" class="btn btn-primary" (click)="open(next)">{{ 'quiz.nextLevel' | t }} <app-icon name="chevron-right" [size]="14" /></button>
            }
            <button type="button" class="btn btn-secondary" (click)="open(level())"><app-icon name="refresh" [size]="14" /> {{ 'quiz.retry' | t }}</button>
          </div>
        } @else {
          @if (submitError(); as err) {
            <div class="callout callout-warn" role="alert">
              <app-icon name="alert" />
              <span>{{ 'quiz.submitFailed' | t }} <span class="muted small">{{ errorText(err) }}</span></span>
            </div>
          }
          @if (changedNote()) { <p class="callout callout-info" role="status"><app-icon name="info" /> {{ 'quiz.changed' | t }}</p> }
          <div class="row-gap">
            <button type="button" class="btn btn-primary" [disabled]="!allAnswered() || busy()" (click)="submit()">
              @if (busy()) { <app-icon name="refresh" class="spin" [size]="14" /> } {{ (submitError() ? 'quiz.resend' : 'quiz.submit') | t }}
            </button>
            @if (!allAnswered()) { <span class="muted small">{{ 'quiz.answerAll' | t: { total: q.questions.length } }}</span> }
          </div>
        }
      }
    </section>
  `,
})
export class TopicQuizComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);

  readonly topicId = input.required<number>();

  protected readonly level = signal<QuizLevel>(1);
  protected readonly quiz = signal<Quiz | null>(null);
  protected readonly levels = signal<QuizLevelInfo[]>([]);
  protected readonly answers = signal<Record<number, number>>({});
  protected readonly result = signal<QuizResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<ApiError | null>(null);
  /** A failed submission: the answers stay on screen and can be sent again. */
  protected readonly submitError = signal<ApiError | null>(null);
  protected readonly changedNote = signal(false);
  /** The order each question's options are shown in (indexes into the option list), shuffled per quiz. */
  private readonly optionOrder = signal<Record<number, number[]>>({});

  protected readonly passPercent = computed(() => this.quiz()?.passPercent ?? 75);
  protected readonly allAnswered = computed(() => {
    const q = this.quiz();
    return !!q && q.questions.every((x) => this.answers()[x.id] !== undefined);
  });
  /** The next level that exists for this topic, once the current one is passed. */
  protected readonly nextLevel = computed<QuizLevel | null>(() =>
    this.levels().find((l) => l.level > this.level() && l.available && l.unlocked)?.level ?? null);
  private readonly results = computed(() => new Map((this.result()?.results ?? []).map((r) => [r.questionId, r])));

  private requestId = 0;

  constructor() {
    effect(() => {
      this.topicId();
      untracked(() => void this.open(1));
    });
  }

  /** Isolates the English and code inside Arabic questions so the browser keeps them in order. */
  protected bidi(text: string | null | undefined): string {
    return isolateLatin(text, this.i18n.lang());
  }

  protected options(question: QuizQuestion): string[] {
    return this.i18n.lang() === 'ar' ? question.optionsAr : question.optionsEn;
  }

  protected orderOf(question: QuizQuestion): number[] {
    return this.optionOrder()[question.id] ?? question.optionsEn.map((_, i) => i);
  }

  protected errorText(error: ApiError): string {
    return this.i18n.errorMessage(error);
  }

  protected resultFor(questionId: number): QuizResultItem | undefined {
    return this.results().get(questionId);
  }

  protected choose(questionId: number, option: number): void {
    if (this.result()) return;
    this.answers.update((a) => ({ ...a, [questionId]: option }));
  }

  /** Loads a fresh set of questions for a level (also used for "try again"). */
  protected async open(level: QuizLevel, changed = false): Promise<void> {
    const id = ++this.requestId;
    this.submitError.set(null);
    this.changedNote.set(changed);
    this.level.set(level);
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.answers.set({});
    try {
      const quiz = await this.api.quiz(this.topicId(), level);
      if (id !== this.requestId) return;
      this.optionOrder.set(Object.fromEntries(quiz.questions.map((q) => [q.id, shuffled(q.optionsEn.map((_, i) => i))])));
      this.quiz.set(quiz);
      this.levels.set(quiz.levels);
    } catch (e) {
      if (id === this.requestId) { this.quiz.set(null); this.error.set(ApiError.from(e)); }
    } finally {
      if (id === this.requestId) this.loading.set(false);
    }
  }

  protected async submit(): Promise<void> {
    const quiz = this.quiz();
    if (!quiz || !this.allAnswered()) return;
    this.busy.set(true);
    this.submitError.set(null);
    const answers = quiz.questions.map((q) => ({ questionId: q.id, choice: this.answers()[q.id] }));
    try {
      let result: QuizResult;
      try {
        result = await this.api.submitQuiz(this.topicId(), quiz.level, answers);
      } catch (e) {
        // A dropped connection or a server waking up: one quiet retry before telling the learner.
        if (!isTransient(ApiError.from(e))) throw e;
        await new Promise((r) => setTimeout(r, 1500));
        result = await this.api.submitQuiz(this.topicId(), quiz.level, answers);
      }
      this.result.set(result);
      this.levels.set(result.levels);
      this.changedNote.set(false);
    } catch (e) {
      const err = ApiError.from(e);
      // The questions changed on the server (new content was published) while this quiz was open.
      if (err.code === 'quiz_invalid_answers') { this.busy.set(false); await this.open(quiz.level, true); return; }
      this.submitError.set(err);
    } finally {
      this.busy.set(false);
    }
  }
}

function isTransient(error: ApiError): boolean {
  return error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504;
}

function shuffled<T>(items: T[]): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

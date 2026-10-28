import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Quiz, QuizLevel, QuizLevelInfo, QuizQuestion, QuizResult, QuizResultItem } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * A short quiz under the topic videos, in three levels that open one after another:
 * this topic, this topic mixed with the topics before it, and a wider review.
 * The API sends questions without answers and grades the submission.
 */
/** A run of text without Arabic letters (Arabic punctuation such as ، and ؟ is in the Arabic block too). */
const LATIN_RUN = /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

@Component({
  selector: 'app-topic-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, SkeletonComponent, ErrorStateComponent],
  template: `
    <section class="card content-section quiz" id="quiz" aria-labelledby="quiz-h">
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
                  @for (option of options(question); track $index; let o = $index) {
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
          <div class="row-gap">
            <button type="button" class="btn btn-primary" [disabled]="!allAnswered() || busy()" (click)="submit()">
              @if (busy()) { <app-icon name="refresh" class="spin" [size]="14" /> } {{ 'quiz.submit' | t }}
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

  /**
   * Questions often quote code ('record ProductDto(int Id);'). Inside Arabic text the browser lays
   * out its punctuation right-to-left and scrambles it, so in Arabic each Latin run is isolated in
   * a left-to-right <bdi>. The text is HTML-escaped first; Angular sanitizes the result as well.
   */
  protected bidi(text: string | null | undefined): string {
    const escaped = escapeHtml(text ?? '');
    if (this.i18n.lang() !== 'ar') return escaped;
    return escaped.replace(LATIN_RUN, (run) => {
      const m = /^(\s*)(.*?)([.,:!?]?\s*)$/s.exec(run)!;
      return /[A-Za-z0-9]/.test(m[2]) ? `${m[1]}<bdi dir="ltr">${m[2]}</bdi>${m[3]}` : run;
    });
  }

  protected options(question: QuizQuestion): string[] {
    return this.i18n.lang() === 'ar' ? question.optionsAr : question.optionsEn;
  }

  protected resultFor(questionId: number): QuizResultItem | undefined {
    return this.results().get(questionId);
  }

  protected choose(questionId: number, option: number): void {
    if (this.result()) return;
    this.answers.update((a) => ({ ...a, [questionId]: option }));
  }

  /** Loads a fresh set of questions for a level (also used for "try again"). */
  protected async open(level: QuizLevel): Promise<void> {
    const id = ++this.requestId;
    this.level.set(level);
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.answers.set({});
    try {
      const quiz = await this.api.quiz(this.topicId(), level);
      if (id !== this.requestId) return;
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
    this.error.set(null);
    try {
      const answers = quiz.questions.map((q) => ({ questionId: q.id, choice: this.answers()[q.id] }));
      const result = await this.api.submitQuiz(this.topicId(), quiz.level, answers);
      this.result.set(result);
      this.levels.set(result.levels);
    } catch (e) {
      this.error.set(ApiError.from(e));
    } finally {
      this.busy.set(false);
    }
  }
}

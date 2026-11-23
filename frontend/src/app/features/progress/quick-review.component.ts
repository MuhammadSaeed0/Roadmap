import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { FlashcardDeck, ReviewItem } from '../../core/models';
import { isolateLatin } from '../../shared/bidi';
import { IconComponent } from '../../shared/icon.component';
import { ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

export type Rating = 'again' | 'good' | 'easy';

const POINTS: Record<Rating, number> = { again: 1, good: 3, easy: 5 };

/**
 * The confidence (0-5) sent to the review endpoint at the end of a topic's cards: the average of
 * Again = 1, Good = 3 and Easy = 5, rounded. All Again gives 1 (review tomorrow), all Good 3 (in 4 days),
 * all Easy 5 (in 16 days). The schedule itself is still decided by the API from this one number.
 */
export function confidenceFrom(ratings: readonly Rating[]): number {
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((sum, r) => sum + POINTS[r], 0) / ratings.length;
  return Math.min(5, Math.max(0, Math.round(average)));
}

/** Days until the next review for a confidence; mirrors ReviewRules in the API, for the message only. */
const DAYS = [1, 1, 2, 4, 8, 16];

/**
 * Flashcards for the topics due for review, one card at a time. Flip with a tap, a swipe, Space or Enter;
 * rate with the buttons or the keys 1, 2 and 3. After a topic's last card the existing complete-review
 * endpoint is called with a confidence derived from the ratings, so the review schedule stays in one place.
 */
@Component({
  selector: 'app-quick-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, ProgressBarComponent, SkeletonComponent],
  template: `
    <section class="card qr" aria-labelledby="qr-h" data-tour="progress-quick-review">
      <div class="qr-head">
        <h2 id="qr-h" class="card-title"><app-icon name="layers" /> {{ 'quickReview.title' | t }}</h2>
        @if (!finished()) {
          <button type="button" class="btn btn-ghost btn-sm" (click)="closed.emit()">{{ 'quickReview.stop' | t }}</button>
        }
      </div>

      @if (finished()) {
        <div class="qr-done" role="status">
          <h3><app-icon name="check-circle" /> {{ 'quickReview.doneTitle' | t }}</h3>
          <p>{{ 'quickReview.done' | t: { n: reviewed() } }}</p>
          <button type="button" class="btn btn-primary" (click)="closed.emit()">{{ 'quickReview.close' | t }}</button>
        </div>
      } @else {
        @if (topic(); as item) {
          <p class="small muted qr-meta">
            {{ 'quickReview.topicOf' | t: { n: topicIndex() + 1, total: items().length } }} ·
            <strong [innerHTML]="bidi(item | loc: 'title')"></strong>
          </p>
        }
        @if (loading()) {
          <app-skeleton [rows]="4" [height]="22" />
        } @else if (loadError()) {
          <p class="callout callout-warn" role="alert"><app-icon name="alert" /> <span>{{ 'quickReview.loadFailed' | t }}</span></p>
          <button type="button" class="btn btn-secondary" (click)="loadTopic()">{{ 'quickReview.retry' | t }}</button>
        } @else if (saveError()) {
          <p class="callout callout-warn" role="alert"><app-icon name="alert" /> <span>{{ 'quickReview.saveFailed' | t }}</span></p>
          <button type="button" class="btn btn-primary" [disabled]="busy()" (click)="save()">{{ 'quickReview.retry' | t }}</button>
        } @else if (card(); as c) {
          <p class="tiny muted" aria-live="polite">{{ 'quickReview.cardOf' | t: { n: cardIndex() + 1, total: deck()!.cards.length } }}</p>
          <app-progress-bar [value]="(cardIndex() + (flipped() ? 1 : 0)) / deck()!.cards.length * 100" [small]="true"
                            [label]="'quickReview.cardOf' | t: { n: cardIndex() + 1, total: deck()!.cards.length }" />

          <div #cardEl class="qr-card" [class.flipped]="flipped()" tabindex="0" role="group"
               [attr.aria-roledescription]="'quickReview.title' | t"
               [attr.aria-label]="'quickReview.cardOf' | t: { n: cardIndex() + 1, total: deck()!.cards.length }"
               (click)="flip()" (pointerdown)="swipeStart($event)" (pointerup)="swipeEnd($event)">
            <p class="qr-label tiny">{{ (c.kind === 'objective' ? 'quickReview.explain' : 'quickReview.question') | t }}</p>
            <p class="qr-front" [innerHTML]="bidi(c | loc: 'front')"></p>
            @if (flipped()) {
              <div class="qr-back">
                <p class="qr-label tiny">{{ 'quickReview.answer' | t }}</p>
                <p class="qr-answer" [innerHTML]="bidi(c | loc: 'back')"></p>
                @if ((c | loc: 'why'); as why) {
                  <p class="qr-why small"><span class="muted">{{ 'quickReview.why' | t }}:</span> <span [innerHTML]="bidi(why)"></span></p>
                }
              </div>
            } @else {
              <p class="qr-hint tiny muted">{{ 'quickReview.flipHint' | t }}</p>
            }
          </div>
          <p class="sr-only" aria-live="polite">{{ flipped() ? ('quickReview.answerShown' | t) : '' }}</p>

          @if (!flipped()) {
            <button type="button" class="btn btn-primary qr-flip" (click)="flip()">{{ 'quickReview.showAnswer' | t }}</button>
          } @else {
            <div class="qr-rate" role="group" [attr.aria-label]="'quickReview.rateLabel' | t">
              @for (r of ratings; track r; let i = $index) {
                <button type="button" class="btn qr-rate-btn" [attr.data-rating]="r" [disabled]="busy()" (click)="rate(r)"
                        [attr.aria-keyshortcuts]="'' + (i + 1)">
                  <span class="qr-rate-name">{{ 'quickReview.' + r | t }}</span>
                  <span class="tiny muted">{{ 'quickReview.' + r + 'Hint' | t }}</span>
                </button>
              }
            </div>
            <p class="tiny muted qr-keys">{{ 'quickReview.keysHint' | t }}</p>
          }
        }
      }
    </section>
  `,
  styles: `
    .qr { display: grid; gap: 12px; }
    .qr-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .qr-head .card-title { margin: 0; }
    .qr-meta { margin: 0; }
    .qr-card { display: grid; gap: 8px; min-height: 180px; padding: 20px; border: 1px solid var(--border); border-radius: var(--radius);
      background: var(--surface-2); cursor: pointer; touch-action: pan-y; user-select: none; }
    .qr-card:focus-visible { outline: none; box-shadow: var(--focus); }
    .qr-card.flipped { cursor: default; background: var(--surface); }
    .qr-label { margin: 0; text-transform: none; color: var(--text-2); font-weight: 600; }
    .qr-front { margin: 0; font-size: 1.1rem; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
    .qr-back { display: grid; gap: 6px; padding-top: 12px; border-top: 1px dashed var(--border); }
    .qr-answer { margin: 0; font-weight: 600; color: var(--accent-text); overflow-wrap: anywhere; }
    .qr-why { margin: 0; overflow-wrap: anywhere; }
    .qr-why > .muted { margin-inline-end: 4px; }
    .qr-hint { margin: auto 0 0; }
    .qr-flip { justify-self: start; }
    .qr-rate { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .qr-rate-btn { display: grid; gap: 2px; justify-items: center; align-content: center; padding: 10px 6px; height: auto; min-height: 56px;
      white-space: normal; text-align: center; line-height: 1.3;
      border: 1px solid var(--border); background: var(--surface); }
    .qr-rate-btn[data-rating='again'] .qr-rate-name { color: var(--danger); }
    .qr-rate-btn[data-rating='good'] .qr-rate-name { color: var(--accent-text); }
    .qr-rate-btn[data-rating='easy'] .qr-rate-name { color: var(--success); }
    .qr-rate-name { font-weight: 700; }
    .qr-keys { margin: 0; }
    .qr-done { display: grid; gap: 8px; justify-items: start; }
    .qr-done h3 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .qr-done p { margin: 0; }
  `,
})
export class QuickReviewComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastText = (title: string, days: number) => this.i18n.t('quickReview.saved', { title, days });

  /** The topics to review, in order (the due list). */
  readonly items = input.required<ReviewItem[]>();
  /** A topic was reviewed and rescheduled: its title and the message to show. */
  readonly saved = output<string>();
  readonly closed = output<void>();

  protected readonly ratings: Rating[] = ['again', 'good', 'easy'];
  protected readonly topicIndex = signal(0);
  protected readonly deck = signal<FlashcardDeck | null>(null);
  protected readonly cardIndex = signal(0);
  protected readonly flipped = signal(false);
  private readonly answers = signal<Rating[]>([]);
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly loadError = signal(false);
  protected readonly saveError = signal(false);
  protected readonly reviewed = signal(0);
  protected readonly finished = computed(() => this.topicIndex() >= this.items().length);
  protected readonly topic = computed(() => this.items()[this.topicIndex()] ?? null);
  protected readonly card = computed(() => this.deck()?.cards[this.cardIndex()] ?? null);
  private readonly cardEl = viewChild<ElementRef<HTMLElement>>('cardEl');
  private swipeX: number | null = null;

  constructor() {
    effect(() => {
      this.topicIndex();
      untracked(() => void this.loadTopic());
    });
  }

  protected bidi(text: string | null | undefined): string { return isolateLatin(text, this.i18n.lang()); }

  protected async loadTopic(): Promise<void> {
    const item = this.topic();
    if (!item) return;
    this.loading.set(true);
    this.loadError.set(false);
    this.saveError.set(false);
    this.deck.set(null);
    this.cardIndex.set(0);
    this.flipped.set(false);
    this.answers.set([]);
    try {
      const deck = await this.api.reviewCards(item.topicId);
      if (deck.cards.length === 0) {
        this.saved.emit(this.i18n.t('quickReview.noCards'));
        this.topicIndex.update(i => i + 1);
        return;
      }
      this.deck.set(deck);
      this.focusCard();
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected flip(): void {
    if (!this.card() || this.flipped()) return;
    this.flipped.set(true);
  }

  protected swipeStart(event: PointerEvent): void { this.swipeX = event.clientX; }

  protected swipeEnd(event: PointerEvent): void {
    // A horizontal swipe in either direction (so it works the same in Arabic and English) flips the card.
    if (this.swipeX !== null && Math.abs(event.clientX - this.swipeX) > 40) this.flip();
    this.swipeX = null;
  }

  protected async rate(rating: Rating): Promise<void> {
    const deck = this.deck();
    if (!deck || !this.flipped() || this.busy()) return;
    this.answers.update(a => [...a, rating]);
    if (this.cardIndex() < deck.cards.length - 1) {
      this.cardIndex.update(i => i + 1);
      this.flipped.set(false);
      this.focusCard();
      return;
    }
    await this.save();
  }

  /** Ends the topic: sends the derived confidence to the existing review endpoint, then moves on. */
  protected async save(): Promise<void> {
    const item = this.topic();
    if (!item) return;
    const confidence = confidenceFrom(this.answers());
    this.busy.set(true);
    this.saveError.set(false);
    try {
      const state = await this.api.completeReview(item.topicId, confidence);
      this.reviewed.update(n => n + 1);
      this.saved.emit(this.toastText(this.i18n.pick(item.titleEn, item.titleAr), state.intervalDays ?? DAYS[confidence]));
      this.topicIndex.update(i => i + 1);
    } catch {
      this.saveError.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const onButton = (event.target as HTMLElement | null)?.closest('button');
    if (!this.flipped() && (event.key === ' ' || event.key === 'Enter') && !onButton) {
      event.preventDefault();
      this.flip();
    } else if (this.flipped() && ['1', '2', '3'].includes(event.key)) {
      event.preventDefault();
      void this.rate(this.ratings[Number(event.key) - 1]);
    }
  }

  /** Puts focus on the new card so keyboard and screen-reader users continue from it. */
  private focusCard(): void {
    setTimeout(() => this.cardEl()?.nativeElement.focus());
  }
}

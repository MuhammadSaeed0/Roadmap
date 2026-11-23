import { TestBed } from '@angular/core/testing';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FlashcardDeck, ReviewItem } from '../../core/models';
import { QuickReviewComponent, confidenceFrom } from './quick-review.component';

const item = (topicId: number, title: string): ReviewItem => ({
  topicId, slug: 't' + topicId, titleEn: title, titleAr: title, skill: 'CSharp', confidence: 2,
  intervalDays: 2, nextReviewOn: '2026-11-23', lastReviewedOn: null, reviewCount: 1, daysOverdue: 0,
});

const deck = (topicId: number, count: number): FlashcardDeck => ({
  topicId, titleEn: 'T', titleAr: 'ت',
  cards: Array.from({ length: count }, (_, i) => ({
    kind: i === 0 ? 'objective' as const : 'question' as const,
    frontEn: `Front ${topicId}.${i + 1}`, frontAr: 'أ', backEn: `Back ${topicId}.${i + 1}`, backAr: 'ب', whyEn: `Why ${i + 1}.`, whyAr: 'لأن.',
  })),
});

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 3; i++) { fixture.detectChanges(); await fixture.whenStable(); await new Promise(r => setTimeout(r, 0)); }
  fixture.detectChanges();
}

describe('confidenceFrom', () => {
  it('maps Again, Good and Easy to a 0-5 confidence for the review schedule', () => {
    expect(confidenceFrom(['again', 'again', 'again'])).toBe(1);
    expect(confidenceFrom(['good', 'good', 'good', 'good'])).toBe(3);
    expect(confidenceFrom(['easy', 'easy', 'easy'])).toBe(5);
    expect(confidenceFrom(['good', 'easy'])).toBe(4);
    expect(confidenceFrom(['again', 'good', 'good', 'easy'])).toBe(3);
    expect(confidenceFrom(['again', 'easy', 'easy', 'easy'])).toBe(4);
    expect(confidenceFrom([])).toBe(0);
  });
});

describe('QuickReviewComponent', () => {
  function setup(api: Partial<ApiService>, items = [item(1, 'Records'), item(2, 'LINQ')]) {
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(QuickReviewComponent);
    fixture.componentRef.setInput('items', items);
    return fixture;
  }

  const button = (el: HTMLElement, text: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.includes(text));
  const key = (el: HTMLElement, k: string) =>
    el.querySelector('.qr-card')!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

  it('flips each card, takes a rating, and completes each topic with the derived confidence', async () => {
    const completed: [number, number][] = [];
    const saved: string[] = [];
    let closed = false;
    const fixture = setup({
      reviewCards: (id: number) => Promise.resolve(deck(id, id === 1 ? 2 : 3)),
      completeReview: (id: number, confidence: number) => {
        completed.push([id, confidence]);
        return Promise.resolve({ intervalDays: [1, 1, 2, 4, 8, 16][confidence], nextReviewOn: '', lastReviewedOn: '', reviewCount: 2, isDue: false });
      },
    });
    fixture.componentInstance.saved.subscribe(m => saved.push(m));
    fixture.componentInstance.closed.subscribe(() => closed = true);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    // Topic 1: the front only, then the answer after "Show answer".
    expect(el.textContent).toContain('Topic 1 of 2');
    expect(el.textContent).toContain('Can you explain this?');
    expect(el.textContent).toContain('Front 1.1');
    expect(el.textContent).not.toContain('Back 1.1');
    expect(button(el, 'Easy')).toBeUndefined();
    button(el, 'Show answer')!.click();
    await settle(fixture);
    expect(el.textContent).toContain('Back 1.1');
    expect(el.textContent).toContain('Why 1.');
    button(el, 'Good')!.click();
    await settle(fixture);

    // The second card is flipped and rated with the keyboard.
    expect(el.textContent).toContain('Card 2 of 2');
    key(el, ' ');
    await settle(fixture);
    expect(el.textContent).toContain('Back 1.2');
    key(el, '3');
    await settle(fixture);
    expect(completed).toEqual([[1, 4]]);   // Good + Easy
    expect(saved).toEqual(['Records: next review in 8 days']);

    // Topic 2: three cards, all Again.
    expect(el.textContent).toContain('Topic 2 of 2');
    for (let i = 0; i < 3; i++) {
      el.querySelector<HTMLElement>('.qr-card')!.click();
      await settle(fixture);
      key(el, '1');
      await settle(fixture);
    }
    expect(completed).toEqual([[1, 4], [2, 1]]);
    expect(el.textContent).toContain('Topics reviewed: 2.');
    button(el, 'Back to the review queue')!.click();
    expect(closed).toBe(true);
  });

  it('keeps the answers when saving fails and saves them again', async () => {
    let calls = 0;
    const fixture = setup({
      reviewCards: (id: number) => Promise.resolve(deck(id, 1)),
      completeReview: () => ++calls === 1
        ? Promise.reject(new Error('offline'))
        : Promise.resolve({ intervalDays: 1, nextReviewOn: '', lastReviewedOn: '', reviewCount: 1, isDue: false }),
    }, [item(1, 'Records')]);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Show answer')!.click();
    await settle(fixture);
    button(el, 'Again')!.click();
    await settle(fixture);

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('couldn’t be saved');
    button(el, 'Try again')!.click();
    await settle(fixture);
    expect(calls).toBe(2);
    expect(el.textContent).toContain('Topics reviewed: 1.');
  });
});

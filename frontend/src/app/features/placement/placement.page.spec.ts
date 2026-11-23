import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { PlacementQuiz, PlacementResult } from '../../core/models';
import PlacementPage from './placement.page';

const question = (id: number, phaseId: number) => ({
  id, phaseId, questionEn: `Question ${id}?`, questionAr: `سؤال ${id}؟`,
  optionsEn: ['Alpha', 'Bravo', 'Charlie', 'Delta'], optionsAr: ['أ', 'ب', 'ج', 'د'],
});

const quiz: PlacementQuiz = { perPhase: 2, questions: [question(1, 10), question(2, 20), question(3, 10), question(4, 20)] };

const phase = (phaseId: number, order: number, correct: number) => ({
  phaseId, order, titleEn: `Phase ${order}`, titleAr: `المرحلة ${order}`, topicCount: 9, correct, total: 2, known: correct === 2,
});
const result: PlacementResult = { phases: [phase(10, 1, 2), phase(20, 2, 1)] };

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 3; i++) { fixture.detectChanges(); await fixture.whenStable(); await new Promise(r => setTimeout(r, 0)); }
  fixture.detectChanges();
}

describe('PlacementPage', () => {
  function setup(api: Partial<ApiService>) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: api }] });
    TestBed.inject(I18nService).lang.set('en');
    return TestBed.createComponent(PlacementPage);
  }

  const button = (el: HTMLElement, text: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.includes(text))!;

  function choose(el: HTMLElement, text: string): void {
    [...el.querySelectorAll('label.quiz-option')].find(l => l.textContent?.trim() === text)!.querySelector('input')!.click();
  }

  it('asks one question at a time, grades all answers, and marks only the phases ticked after confirming', async () => {
    let graded: { questionId: number; choice: number }[] = [];
    const applied: number[][] = [];
    const fixture = setup({
      placement: () => Promise.resolve(quiz),
      gradePlacement: answers => { graded = answers; return Promise.resolve(result); },
      applyPlacement: ids => { applied.push(ids); return Promise.resolve({ phaseIds: ids, topicsMarked: 9 }); },
    });
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    button(el, 'Start the check').click();
    await settle(fixture);
    const choices = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
    for (let n = 0; n < 4; n++) {
      expect(el.querySelectorAll('.quiz-question').length).toBe(1);
      expect(el.textContent).toContain(`Question ${n + 1} of 4`);
      expect(el.textContent).toContain(`Question ${n + 1}?`);
      const next = button(el, n < 3 ? 'Next' : 'See my result');
      expect(next.disabled).toBe(true);   // an answer comes first
      choose(el, choices[n]);
      await settle(fixture);
      next.click();
      await settle(fixture);
    }

    expect(graded).toEqual([{ questionId: 1, choice: 0 }, { questionId: 2, choice: 1 }, { questionId: 3, choice: 2 }, { questionId: 4, choice: 3 }]);
    const rows = [...el.querySelectorAll('.pl-phase')];
    expect(rows.map(r => r.querySelector('.pl-verdict')?.textContent?.trim())).toEqual(['You seem to know this', 'Worth learning']);
    expect(rows[1].textContent).toContain('1 of 2 right');

    // Nothing is ticked or marked yet.
    expect(el.querySelectorAll('input[type="checkbox"]:checked').length).toBe(0);
    expect(button(el, 'Mark the ticked phases').disabled).toBe(true);
    expect(applied).toEqual([]);

    button(el, 'Tick the phases I seem to know').click();
    await settle(fixture);
    expect(applied).toEqual([]);   // ticking is not confirming
    button(el, 'Mark the ticked phases as known (1)').click();
    await settle(fixture);

    expect(applied).toEqual([[10]]);
    expect(el.textContent).toContain('Topics now marked as already known: 9.');
  });

  it('keeps the answers when grading fails, and sends them again', async () => {
    let calls = 0;
    const fixture = setup({
      placement: () => Promise.resolve({ perPhase: 1, questions: [question(1, 10)] }),
      gradePlacement: () => ++calls === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(result),
    });
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Start the check').click();
    await settle(fixture);
    choose(el, 'Bravo');
    await settle(fixture);
    button(el, 'See my result').click();
    await settle(fixture);

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Your answers couldn’t be checked');
    expect(el.querySelectorAll('input:checked').length).toBe(1);
    button(el, 'Check again').click();
    await settle(fixture);
    expect(calls).toBe(2);
    expect(el.querySelectorAll('.pl-phase').length).toBe(2);
  });
});

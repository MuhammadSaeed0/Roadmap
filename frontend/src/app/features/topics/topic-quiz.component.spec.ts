import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Quiz, QuizResult } from '../../core/models';
import { TopicQuizComponent } from './topic-quiz.component';

const levels = [1, 2, 3].map((level) => ({
  level: level as 1 | 2 | 3, available: level === 1, unlocked: level === 1, questionCount: level === 1 ? 2 : 0,
  bestScore: null, bestTotal: null, passed: false, attempts: 0,
}));

const question = (id: number) => ({
  id, topicId: 7, topicTitleEn: 'Topic', topicTitleAr: 'موضوع', questionEn: `Question ${id}?`, questionAr: `سؤال ${id}؟`,
  optionsEn: ['Alpha', 'Bravo', 'Charlie', 'Delta'], optionsAr: ['أ', 'ب', 'ج', 'د'],
});

const quiz = (ids: number[]): Quiz => ({ topicId: 7, level: 1, passPercent: 75, levels, questions: ids.map(question) });

const result: QuizResult = {
  level: 1, score: 2, total: 2, passed: true, levels,
  results: [1, 2].map((id) => ({ questionId: id, choice: 1, correctIndex: 1, isCorrect: true, explanationEn: 'Because.', explanationAr: 'لأن.' })),
};

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 3; i++) { fixture.detectChanges(); await fixture.whenStable(); await new Promise((r) => setTimeout(r, 0)); }
  fixture.detectChanges();
}

describe('TopicQuizComponent', () => {
  function setup(api: Partial<ApiService>) {
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(TopicQuizComponent);
    fixture.componentRef.setInput('topicId', 7);
    return fixture;
  }

  /** Clicks the option with this English text in the given question. */
  function choose(el: HTMLElement, questionIndex: number, text: string): void {
    const item = el.querySelectorAll('.quiz-question')[questionIndex];
    const label = [...item.querySelectorAll('label')].find((l) => l.textContent?.trim() === text)!;
    label.querySelector('input')!.click();
  }

  it('shows the options in a shuffled order but submits the index of the option chosen', async () => {
    let sent: { questionId: number; choice: number }[] = [];
    const fixture = setup({
      quiz: () => Promise.resolve(quiz([1, 2])),
      submitQuiz: (_t: number, _l: number, answers: { questionId: number; choice: number }[]) => { sent = answers; return Promise.resolve(result); },
    });
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    // Every option is there whatever the order.
    const shown = [...el.querySelectorAll('.quiz-question')[0].querySelectorAll('label')].map((l) => l.textContent?.trim()).sort();
    expect(shown).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);

    choose(el, 0, 'Bravo');
    choose(el, 1, 'Delta');
    await settle(fixture);
    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await settle(fixture);

    expect(sent).toEqual([{ questionId: 1, choice: 1 }, { questionId: 2, choice: 3 }]);
    expect(el.textContent).toContain('You scored 2 out of 2.');
  });

  it('keeps the answers when sending fails, and sends them again', async () => {
    let calls = 0;
    const fixture = setup({
      quiz: () => Promise.resolve(quiz([1, 2])),
      submitQuiz: () => {
        calls++;
        return calls === 1
          ? Promise.reject(new HttpErrorResponse({ status: 500, error: { code: 'server_error' } }))
          : Promise.resolve(result);
      },
    });
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    choose(el, 0, 'Bravo');
    choose(el, 1, 'Bravo');
    await settle(fixture);

    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await settle(fixture);
    // The questions and choices are still on screen, with a message and a "Send again" button.
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Your answers couldn’t be sent');
    expect(el.querySelectorAll('input:checked').length).toBe(2);
    const resend = el.querySelector<HTMLButtonElement>('.btn-primary')!;
    expect(resend.textContent).toContain('Send again');

    resend.click();
    await settle(fixture);
    expect(calls).toBe(2);
    expect(el.textContent).toContain('You scored 2 out of 2.');
  });

  it('loads a fresh set when the questions changed on the server', async () => {
    let loads = 0;
    const fixture = setup({
      quiz: () => { loads++; return Promise.resolve(quiz(loads === 1 ? [1, 2] : [3, 4])); },
      submitQuiz: () => Promise.reject(new HttpErrorResponse({ status: 400, error: { code: 'quiz_invalid_answers' } })),
    });
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    choose(el, 0, 'Alpha');
    choose(el, 1, 'Alpha');
    await settle(fixture);
    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await settle(fixture);

    expect(loads).toBe(2);
    expect(el.textContent).toContain('Question 3?');
    expect(el.textContent).toContain('Here is a fresh set');
  });
});

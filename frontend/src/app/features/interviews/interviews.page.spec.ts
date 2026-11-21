import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { InterviewCategory, InterviewList, InterviewQuestion } from '../../core/models';
import InterviewsPage from './interviews.page';
import { pickMockQuestions } from './mock-interview.component';

const question = (id: number, category: InterviewCategory, topicId: number, topic: string): InterviewQuestion => ({
  id, key: 'q' + id, category, topicId, topicTitleEn: topic, topicTitleAr: topic, difficulty: 'Beginner',
  questionEn: 'Question ' + id, questionAr: 'سؤال ' + id, answerEn: 'Answer ' + id, answerAr: 'إجابة ' + id,
  exampleCode: null, followUpEn: null, followUpAr: null, rating: null, timesPracticed: 0, lastPracticedAt: null,
});

const all = [
  question(1, 'CSharp', 10, 'Generics'), question(2, 'CSharp', 11, 'LINQ'), question(3, 'CSharp', 11, 'LINQ'),
  question(4, 'Angular', 20, 'Signals'), question(5, 'Angular', 20, 'Signals'), question(6, 'SqlServer', 30, 'Indexes'),
];
const list: InterviewList = { questions: all, categories: [] };

async function render(rateQuestion = vi.fn()) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ApiService, useValue: { interviews: () => Promise.resolve(list), rateQuestion } }],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(InterviewsPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const button = (el: HTMLElement, label: string) => [...el.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.includes(label))!;

describe('Interview preparation', () => {
  it('mixes categories in a mock interview before repeating one', () => {
    const picked = pickMockQuestions(all, ['CSharp', 'Angular', 'SqlServer'], 4, () => 0.5);
    expect(picked).toHaveLength(4);
    expect(new Set(picked.slice(0, 3).map(q => q.category)).size).toBe(3);
    expect(new Set(picked.map(q => q.id)).size).toBe(4);
    expect(pickMockQuestions(all, ['SqlServer'], 5)).toHaveLength(1);
  });

  it('filters the questions by topic', async () => {
    const { fixture, el } = await render();
    const select = el.querySelector<HTMLSelectElement>('#iq-topic')!;
    expect([...select.options].map(o => o.textContent?.trim())).toEqual(['All topics', 'Generics (1)', 'Indexes (1)', 'LINQ (2)', 'Signals (2)']);
    select.value = '11';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.textContent).toContain('2 questions');
    expect([...el.querySelectorAll('.qa-q')].map(q => q.textContent)).toEqual(['Question 2', 'Question 3']);
  });

  it('runs a timed mock interview: the answer opens when time is up, and the summary counts the ratings', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    try {
      const rateQuestion = vi.fn((id: number, rating: string) => Promise.resolve({ ...all.find(q => q.id === id)!, rating }));
      const { fixture, el } = await render(rateQuestion);
      button(el, 'Mock interview').click();
      await fixture.whenStable();
      fixture.detectChanges();
      button(el, '5').click();
      button(el, '2 min').click();
      fixture.detectChanges();
      button(el, 'Start the interview').click();
      fixture.detectChanges();
      expect(el.querySelector('.mock-timer')?.textContent).toBe('2:00');

      vi.advanceTimersByTime(120_000);
      fixture.detectChanges();
      expect(el.textContent).toContain('Time is up');
      button(el, 'Partial').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(rateQuestion).toHaveBeenCalledTimes(1);
      expect(el.querySelector('.mock-timer')?.textContent).toBe('2:00');

      button(el, 'I answered').click();
      fixture.detectChanges();
      button(el, 'Confident').click();
      await fixture.whenStable();
      fixture.detectChanges();
      button(el, 'End the interview').click();
      fixture.detectChanges();

      const summary = el.querySelector('.mock-summary')!;
      expect(summary.querySelectorAll('.mock-results li').length).toBe(3);
      expect(summary.textContent).toContain('Not rated');
      expect(summary.textContent).toContain('time ran out');
    } finally {
      vi.useRealTimers();
    }
  });
});

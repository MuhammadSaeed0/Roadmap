import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ExerciseSummary, PracticeOverview } from '../../core/models';
import PracticePage from './practice.page';

const exercise = (id: number, runner: ExerciseSummary['runner']): ExerciseSummary => ({
  id, key: 'e' + id, type: 'Coding', topicId: 1, topicTitleEn: 'Loops', topicTitleAr: 'الحلقات', difficulty: 'Beginner',
  estimatedMinutes: 10, titleEn: 'Exercise ' + id, titleAr: 'تمرين ' + id, status: 'NotStarted', skill: 'CSharp',
  runner, technologies: [], bestScore: null,
});

const overview: PracticeOverview = {
  exercises: [exercise(1, 'CSharp'), exercise(2, 'None'), exercise(3, 'Sql')],
  stats: [], skills: [], total: 3, completed: 0, attempted: 0,
};

describe('PracticePage', () => {
  it('puts the "runs in the browser" filter first, with its count, and filters with one click', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { practice: () => Promise.resolve(overview) } }] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(PracticePage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const toggle = el.querySelector<HTMLButtonElement>('.practice-filters > .run-toggle')!;
    expect(el.querySelector('.practice-filters')?.firstElementChild).toBe(toggle);
    expect(toggle.textContent).toContain('Runs in the browser');
    expect(toggle.querySelector('.run-count')?.textContent).toBe('2');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(el.textContent).toContain('Showing 3 of 3 exercises');

    toggle.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.textContent).toContain('Showing 2 of 3 exercises');
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Dashboard, StudyPlan } from '../../core/models';
import DashboardPage from './dashboard.page';

const dashboard = {
  overall: { percent: 12.5, doneTopics: 20, remainingTopics: 146, remainingMinutes: 600, currentPhase: null },
  recommendation: null, projects: [], skills: [], recentActivity: [],
  reviewsDue: 0, minutesThisWeek: 0, streakDays: 0, dailyGoalMinutes: 60, minutesToday: 0,
} as unknown as Dashboard;

const step = (kind: string, topicId: number | null, titleEn: string) =>
  ({ kind, minutes: 20, titleEn, titleAr: titleEn, topicId, exerciseId: null, projectId: null, projectTaskId: null, interviewCategory: null });

const plan = {
  minutes: 60,
  items: [step('learn', 5, 'Lambda expressions'), step('practice', 5, 'Lambda expressions'), step('review', null, 'Review: LINQ')],
} as unknown as StudyPlan;

async function render(fullName: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { dashboard: () => Promise.resolve(dashboard), activePaths: () => Promise.resolve([]), studyPlan: () => Promise.resolve(plan) } },
      { provide: AuthService, useValue: { account: signal({ fullName }) } },
    ],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(DashboardPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('DashboardPage', () => {
  it('greets the learner by first name', async () => {
    const el = await render('Mohamed Abdelaziz');
    expect(el.querySelector('h1')?.textContent).toMatch(/^Good (morning|afternoon|evening), Mohamed$/);
  });

  it('shows the topic of consecutive plan steps once, above the steps', async () => {
    const el = await render('Mohamed');
    expect([...el.querySelectorAll('.plan-group')].map(g => g.textContent)).toEqual(['Lambda expressions']);
    const titles = [...el.querySelectorAll('.plan-item .plan-title')].map(t => t.textContent?.trim());
    expect(titles).toEqual(['Learn the concept', 'Do the practice task', 'Review: LINQ']);
  });

  it('hides recent activity until there is some', async () => {
    const el = await render('');
    expect(el.querySelector('[data-tour="dashboard-activity"]')).toBeNull();
    expect(el.querySelector('h1')?.textContent).toMatch(/^Good (morning|afternoon|evening)$/);
  });
});

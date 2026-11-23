import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { CurrentGuidedProject, Dashboard, StudyPlan } from '../../core/models';
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

async function render(fullName: string, library: CurrentGuidedProject | null = null, data: Dashboard = dashboard): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { dashboard: () => Promise.resolve(data), activePaths: () => Promise.resolve([]), studyPlan: () => Promise.resolve(plan),
        currentGuidedProject: () => Promise.resolve(library) } },
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

  it('shows the current library project with its next step, and hides the card when there is none', async () => {
    const el = await render('Mohamed', {
      id: 12, skill: 'CSharp', level: 'Beginner', titleEn: 'Console to-do list', titleAr: 'قائمة مهام', stepCount: 8, doneSteps: 3,
      nextStepTitleEn: 'Save tasks to a file', nextStepTitleAr: 'احفظ المهام في ملف',
    });
    const card = el.querySelector('[data-tour="dashboard-library"]')!;
    expect(card.textContent).toContain('Your current library project');
    expect(card.textContent).toContain('Next step: Save tasks to a file');
    expect(card.textContent).toContain('3/8');
    expect(card.querySelector('a.proj-link')?.getAttribute('href')).toBe('/project-library/12');
    TestBed.resetTestingModule();
    expect((await render('Mohamed')).querySelector('[data-tour="dashboard-library"]')).toBeNull();
  });

  it('hides recent activity until there is some', async () => {
    const el = await render('');
    expect(el.querySelector('[data-tour="dashboard-activity"]')).toBeNull();
    expect(el.querySelector('h1')?.textContent).toMatch(/^Good (morning|afternoon|evening)$/);
  });

  it('puts due reviews at the top only when there are some', async () => {
    const due = await render('Mohamed', null, { ...dashboard, reviewsDue: 3 });
    const banner = due.querySelector('.due-banner')!;
    expect(banner.textContent).toContain('3 topics are due for review today');
    expect(banner.querySelector('a')?.getAttribute('href')).toBe('/progress?tab=review');
    expect(due.querySelector('.dash-main')?.firstElementChild).toBe(banner);
    TestBed.resetTestingModule();
    const none = await render('Mohamed');
    expect(none.querySelector('.due-banner')).toBeNull();
  });

  it('offers the placement check only while no topic is done', async () => {
    const fresh = await render('Mohamed', null, { ...dashboard, overall: { ...dashboard.overall, doneTopics: 0 } });
    const offer = fresh.querySelector('.placement-offer')!;
    expect(offer.textContent).toContain('Already know some of this? Take a 10-minute check');
    expect(offer.querySelector('a')?.getAttribute('href')).toBe('/placement');
    TestBed.resetTestingModule();
    expect((await render('Mohamed')).querySelector('.placement-offer')).toBeNull();
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { EvidenceScore, SkillLevel } from '../../core/models';
import SkillLevelPage from './skill-level.page';

const evidence = (knowledge: number, project: number): EvidenceScore[] => [
  { kind: 'Passive', score: 50, points: 10, maxPoints: 20 },
  { kind: 'Knowledge', score: knowledge, points: knowledge, maxPoints: 100 },
  { kind: 'Practical', score: 0, points: 0, maxPoints: 0 },
  { kind: 'Project', score: project, points: project, maxPoints: 100 },
  { kind: 'Quality', score: 0, points: 0, maxPoints: 0 },
];

const level: SkillLevel = {
  level: 'junior', levelIndex: 1, nextLevel: 'mid', xpLevel: 'mid', xpAheadOfSkills: true,
  xp: 2450, maxXp: 40000, overall: 31.4, progressToNext: 64,
  levels: ['beginner', 'junior', 'mid', 'senior', 'expert'].map((key, index) => ({ key, index, minXp: [0, 500, 2000, 6000, 12000][index], met: index <= 1, requirements: [] })),
  categories: [
    { key: 'database', weight: 9, score: 22.5, proficiency: 'foundational', evidence: evidence(30, 10), points: 120, maxPoints: 900 },
    { key: 'csharp', weight: 9, score: 61, proficiency: 'proficient', evidence: evidence(80, 40), points: 600, maxPoints: 1000 },
  ],
  technologies: [{
    skill: 'SqlServer', score: 22.5, evidence: evidence(30, 10), points: 120, topicsDone: 3, topicsTotal: 14,
    exercisesDone: 2, projectTasksDone: 1, questionsAnswered: 12, accuracy: 58.3, proficiency: 'foundational',
  }],
  stats: {
    videosWatched: 14, questionsAnswered: 40, correctAnswers: 31, accuracy: 77.5, quizAttempts: 9, topicsCompleted: 20,
    exercisesCompleted: 6, projectTasksCompleted: 7, projectsCompleted: 0, learningHours: 12.5, technologiesMastered: 0,
    verifiedPoints: 1800, selfReportedPoints: 650,
  },
  weakCategories: ['database'],
  weakTopics: [{ topicId: 41, titleEn: 'Indexes', titleAr: 'الفهارس', category: 'database', answered: 6, correct: 2, accuracy: 33.3 }],
  nextLevelRequirements: [
    {
      requirement: { code: 'category', category: 'database', current: 22.5, required: 35, met: false },
      actions: [{ code: 'passQuiz', category: 'database', ref: { type: 'topic', id: 41, level: 1 }, titleEn: 'Indexes', titleAr: 'الفهارس', amount: null }],
    },
    {
      requirement: { code: 'projectsCompleted', category: null, current: 0, required: 1, met: false },
      actions: [{ code: 'finishProject', category: 'projects', ref: { type: 'project', id: 1, level: null }, titleEn: 'Employee Management', titleAr: 'إدارة الموظفين', amount: 7 }],
    },
  ],
  assessment: [{
    category: 'database', band: 'foundation', stale: true,
    checks: [{ code: 'debuggingChallenge', category: 'database', ref: { type: 'exercise', id: 9, level: null }, titleEn: 'Slow query', titleAr: 'استعلام بطيء', amount: null }],
  }],
  recentTransactions: [
    { id: 2, sourceKey: 'topic:1', activity: 'TopicCompleted', evidence: 'Passive', verification: 'SelfReported', points: -5, balance: 0, categories: ['fundamentals'], occurredAt: null, createdAt: '2026-11-06T10:00:00Z' },
    { id: 1, sourceKey: 'quiz-q:10', activity: 'QuizQuestion', evidence: 'Knowledge', verification: 'QuizVerified', points: 10, balance: 10, categories: ['database'], occurredAt: null, createdAt: '2026-11-05T10:00:00Z' },
  ],
  levelHistory: [{ level: 'junior', previousLevel: 'beginner', xp: 600, overall: 12, changedAt: '2026-11-01T10:00:00Z' }],
};

async function render(lang: 'en' | 'ar', data: SkillLevel = level): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ApiService, useValue: { skillLevel: () => Promise.resolve(data) } }],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(SkillLevelPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('SkillLevelPage', () => {
  it('shows the level, the competency gap warning and what the next level needs, with links', async () => {
    const el = await render('en');
    expect(el.querySelector('[data-testid="level-name"]')?.textContent).toContain('Junior Developer');
    const hero = el.querySelector('[data-tour="skills-level"]')!.textContent!;
    expect(hero).toContain('Your points alone would make you Mid-Level Developer');
    expect(hero).toContain('1,800 XP verified or evidenced');

    const next = el.querySelector('[data-tour="skills-next"]')!;
    expect(next.textContent).toContain('What you need for Mid-Level Developer');
    expect(next.textContent).toContain('Database design and SQL score');
    expect(next.textContent).toContain('Finish the project “Employee Management” (7 tasks left)');
    const quizLink = [...next.querySelectorAll('a')].find(a => a.textContent?.includes('Pass the quiz of “Indexes”'))!;
    expect(quizLink.getAttribute('href')).toBe('/topics/41#quiz');
  });

  it('shows categories, weaknesses, the technology profile and the points history', async () => {
    const el = await render('en');
    const categories = el.querySelector('[data-tour="skills-categories"]')!.textContent!;
    expect(categories).toContain('C# and advanced C#');
    expect(categories).toContain('Proficient');
    // Evidence kinds with no content (practical, quality) are not shown for a category.
    expect(categories).not.toContain('Practical 0');

    expect(el.querySelector('[data-tour="skills-weak"]')!.textContent).toContain('33% of 6 answers');
    const check = el.querySelector('[data-tour="skills-checks"] a')!;
    expect(check.getAttribute('href')).toBe('/practice/9');
    expect(el.querySelector('[data-tour="skills-checks"]')!.textContent).toContain('Re-check');

    const row = el.querySelector('[data-tour="skills-profile"] tbody tr')!.textContent!;
    expect(row).toContain('SQL Server');
    expect(row).toContain('58%');

    const history = el.querySelector('[data-tour="skills-history"]')!.textContent!;
    expect(history).toContain('-5');
    expect(history).toContain('+10');
    expect(history).toContain('Quiz-verified');
  });

  it('is fully translated in Arabic', async () => {
    const el = await render('ar');
    expect(el.querySelector('[data-testid="level-name"]')?.textContent).toContain('مطوّر مبتدئ');
    expect(el.querySelector('[data-tour="skills-next"]')!.textContent).toContain('درجة تصميم قواعد البيانات و SQL');
    expect(el.querySelector('[data-tour="skills-weak"]')!.textContent).toContain('الفهارس');
  });

  it('congratulates at the top level and lists nothing missing', async () => {
    const el = await render('en', { ...level, level: 'expert', levelIndex: 4, nextLevel: null, xpAheadOfSkills: false, nextLevelRequirements: [] });
    expect(el.textContent).toContain('You have reached the top level');
    expect(el.textContent).not.toContain('Your points alone would make you');
  });
});

import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TopicDetail } from '../../core/models';
import TopicDetailPage from './topic-detail.page';

const never = () => new Promise<never>(() => undefined);

const topic: TopicDetail = {
  id: 7, slug: 'devops-ci-cd', phase: { id: 13, slug: 'cloud-devops', order: 13, titleEn: 'Cloud', titleAr: 'السحابة' } as TopicDetail['phase'],
  order: 2, skill: 'DevOps', priority: 'Core', estimatedMinutes: 60,
  titleEn: 'CI/CD pipelines', titleAr: 'خطوط CI/CD', summaryEn: 'S', summaryAr: 'م', whyEn: 'W', whyAr: 'ل', howEn: 'H', howAr: 'ك',
  exampleEn: 'E', exampleAr: 'م', codeSample: null, codeLanguage: null, practiceTaskEn: 'P', practiceTaskAr: 'ت', challengeEn: 'C', challengeAr: 'ت',
  status: 'NotStarted', knowledge: 'Unassessed', confidence: null, completedAt: null, prerequisitesMet: true,
  prerequisites: [], unlocks: [], previous: null,
  next: { id: 8, slug: 'docker', titleEn: 'Docker', titleAr: 'دوكر', status: 'NotStarted' } as TopicDetail['next'], resources: [], projects: [], interviewQuestions: [], exercises: [],
  sessions: [], totalMinutesStudied: 0, noteCount: 0, review: null,
  objectivesEn: ['Write a workflow', 'Keep secrets out of the repository'],
  objectivesAr: ['كتابة مسار عمل', 'إبقاء الأسرار خارج المستودع'],
  difficulty: 'Intermediate',
  demand: [{ technology: 'CI/CD', postings: 17, required: 15, share: 47.2, totalPostings: 36, run: '2026-11-06', periodFrom: '2026-08-06', periodTo: '2026-11-06' }],
  guidedProjects: [],
};

async function render(lang: 'en' | 'ar', data: TopicDetail = topic): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { topic: () => Promise.resolve(data), notes: () => Promise.resolve([]), topicVideos: never, quiz: never } },
    ],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(TopicDetailPage);
  fixture.componentRef.setInput('id', '7');
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('TopicDetailPage', () => {
  it('shows the objectives, the difficulty and the job-market demand', async () => {
    const el = await render('en');
    expect([...el.querySelectorAll('#objectives li')].map(li => li.textContent?.trim())).toEqual(topic.objectivesEn);
    expect(el.querySelector('.topic-header')?.textContent).toContain('Intermediate');
    const demand = el.querySelector('.demand-card')!;
    expect(demand.textContent).toContain('Job market demand');
    expect(demand.textContent).toContain('CI/CD');
    expect(demand.textContent).toContain('47.2%');
    expect(demand.textContent).toContain('In 17 of 36 job postings (15 as a requirement)');
  });

  it('shows the Arabic objectives and labels in Arabic', async () => {
    const el = await render('ar');
    const objectives = [...el.querySelectorAll('#objectives li')].map(li => li.textContent ?? '');
    expect(objectives[0]).toContain('كتابة مسار عمل');
    expect(el.querySelector('.demand-card')?.textContent).toContain('الطلب في سوق العمل');
  });

  it('lists the sections, merges the summaries into one overview and links the next topic', async () => {
    const el = await render('en');
    const toc = [...el.querySelectorAll('.toc-list a')].map(a => a.getAttribute('href'));
    expect(toc).toEqual(['#overview', '#tutorial', '#videos', '#quiz', '#practice', '#discussions', '#resources', '#notes']);
    const overview = el.querySelector('#overview')!;
    expect(overview.querySelector('.lead')?.textContent).toContain('S');
    expect(overview.querySelectorAll('.fact').length).toBe(3);
    expect(el.querySelector('#code')).toBeNull();
    expect(el.querySelector('#practice')?.textContent).toContain('Independent challenge');
    const next = [...el.querySelectorAll('.pager-link')];
    expect(next.length).toBe(1);
    expect(next[0].textContent).toContain('Docker');
  });

  it('suggests library projects that practise the topic', async () => {
    const el = await render('en', { ...topic, guidedProjects: [
      { id: 61, skill: 'DevOps', level: 'Beginner', titleEn: 'CI pipeline', titleAr: 'خط CI', stepCount: 8, doneSteps: 8 },
      { id: 62, skill: 'DevOps', level: 'Intermediate', titleEn: 'Continuous deployment', titleAr: 'نشر مستمر', stepCount: 9, doneSteps: 0 },
    ] });
    const practice = el.querySelector('#practice')!;
    expect(practice.querySelector('[data-tour="topic-guided"]')?.textContent).toContain('Practise with a project');
    const links = [...practice.querySelectorAll('a[href^="/project-library/"]')];
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/project-library/61', '/project-library/62']);
    expect(practice.querySelector('[data-status="Completed"]')).not.toBeNull();
  });

  it('has no project suggestions when no project uses the topic', async () => {
    const el = await render('en');
    expect(el.querySelector('[data-tour="topic-guided"]')).toBeNull();
  });

  it('folds a side panel and remembers it', async () => {
    localStorage.removeItem('devpath.topicPanels');
    const el = await render('en');
    const toggle = el.querySelector<HTMLButtonElement>('.toc-panel .panel-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    TestBed.inject(ApplicationRef).tick();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.toc-list')).toBeNull();
    expect(JSON.parse(localStorage.getItem('devpath.topicPanels') ?? '[]')).toEqual(['toc']);
    localStorage.removeItem('devpath.topicPanels');
  });

  it('hides the objectives and demand when a topic has none', async () => {
    const el = await render('en', { ...topic, objectivesEn: [], objectivesAr: [], difficulty: null, demand: [] });
    expect(el.querySelector('#objectives')).toBeNull();
    expect(el.querySelector('.demand-card')).toBeNull();
  });

  it('ends the lesson with one button that completes the topic and opens the next one', async () => {
    const updateTopicProgress = vi.fn(() => Promise.resolve({ completedAt: '2026-11-21T10:00:00Z' }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { topic: () => Promise.resolve(topic), notes: () => Promise.resolve([]), topicVideos: never, quiz: never, updateTopicProgress } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TopicDetailPage);
    fixture.componentRef.setInput('id', '7');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector<HTMLButtonElement>('.finish-btn')!;
    expect(button.textContent).toContain('Finish and go to the next topic');
    expect(el.querySelector('.finish-bar p')).toBeNull();
    button.click();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(updateTopicProgress).toHaveBeenCalledWith(7, expect.objectContaining({ status: 'Completed' }));
    expect(navigate).toHaveBeenCalledWith(['/topics', 8]);
    fixture.detectChanges();
    expect(el.querySelector('.finish-btn')).toBeNull();
  });

  it('offers only "Mark as completed" on the last topic, and nothing once it is done', async () => {
    const last = await render('en', { ...topic, next: null });
    expect(last.querySelector('.finish-btn')?.textContent).toContain('Mark as completed');
    TestBed.resetTestingModule();
    const done = await render('en', { ...topic, status: 'Completed' });
    expect(done.querySelector('.finish-bar')).toBeNull();
  });
});

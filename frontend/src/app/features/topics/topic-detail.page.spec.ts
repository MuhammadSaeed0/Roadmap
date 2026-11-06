import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  prerequisites: [], unlocks: [], samePhase: [], resources: [], projects: [], interviewQuestions: [], exercises: [],
  sessions: [], totalMinutesStudied: 0, noteCount: 0, review: null,
  objectivesEn: ['Write a workflow', 'Keep secrets out of the repository'],
  objectivesAr: ['كتابة مسار عمل', 'إبقاء الأسرار خارج المستودع'],
  difficulty: 'Intermediate',
  demand: [{ technology: 'CI/CD', postings: 17, required: 15, share: 47.2, totalPostings: 36, run: '2026-11-06', periodFrom: '2026-08-06', periodTo: '2026-11-06' }],
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

  it('hides the objectives and demand when a topic has none', async () => {
    const el = await render('en', { ...topic, objectivesEn: [], objectivesAr: [], difficulty: null, demand: [] });
    expect(el.querySelector('#objectives')).toBeNull();
    expect(el.querySelector('.demand-card')).toBeNull();
  });
});

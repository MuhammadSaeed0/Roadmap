import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Phase, Roadmap, TopicSummary } from '../../core/models';
import RoadmapPage from './roadmap.page';

const phase = (id: number, percent: number, extra: Partial<Phase> = {}): Phase => ({
  id, slug: 'p' + id, order: id, titleEn: 'Phase ' + id, titleAr: 'مرحلة ' + id, descriptionEn: '', descriptionAr: '',
  topicCount: 2, doneCount: percent >= 100 ? 2 : 0, percent, remainingMinutes: 0, topics: [], projects: [], guidedProjects: [], ...extra,
});

async function render(data: Roadmap): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { roadmap: () => Promise.resolve(data) } }] });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(RoadmapPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  // The current phase opens once the data arrives.
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('RoadmapPage', () => {
  it('marks a finished phase and lists its library and main projects inside it', async () => {
    const el = await render({
      currentPhaseId: 1,
      phases: [
        phase(1, 100, {
          guidedProjects: [{ id: 12, skill: 'CSharp', level: 'Beginner', titleEn: 'Console to-do list', titleAr: 'قائمة مهام', stepCount: 8, doneSteps: 8 }],
          projects: [{ id: 1, slug: 'tasks', titleEn: 'Task tracker', titleAr: 'متتبع المهام', techStack: 'ASP.NET Core', percent: 0 }],
        }),
        phase(2, 40),
      ],
    });
    const [done, open] = [...el.querySelectorAll('.phase')];
    expect(done.querySelector('.phase-badge')?.textContent).toContain('Phase complete');
    expect(open.querySelector('.phase-badge')).toBeNull();
    expect(done.textContent).toContain('Main projects you can start after this phase.');
    const library = done.querySelector<HTMLAnchorElement>('.guided-tile')!;
    expect(library.getAttribute('href')).toBe('/project-library/12');
    expect(library.textContent).toContain('Console to-do list');
    expect(library.querySelector('[data-status="Completed"]')).not.toBeNull();
  });

  it('gives a topic with unfinished prerequisites a lock beside its title (named for screen readers) and keeps the full chip', async () => {
    const topic = (id: number, prerequisitesMet: boolean) => ({
      id, slug: 't' + id, phaseId: 1, order: id, skill: 'CSharp', priority: 'Core', estimatedMinutes: 30, titleEn: 'Topic ' + id, titleAr: 'موضوع ' + id,
      summaryEn: '', summaryAr: '', status: 'NotStarted', knowledge: 'Unassessed', confidence: null, inReview: false, prerequisitesMet,
    }) as unknown as TopicSummary;
    const el = await render({ currentPhaseId: 1, phases: [phase(1, 0, { topics: [topic(1, false), topic(2, true)] })] });
    const [locked, open] = [...el.querySelectorAll('.rm-row')];

    const lock = locked.querySelector('.topic-head .topic-lock')!;
    expect(lock.getAttribute('title')).toBe('Prerequisites not finished');
    expect(lock.querySelector('.sr-only')?.textContent).toBe('Prerequisites not finished');
    expect(locked.querySelector('.chip-lock')?.textContent).toContain('Prerequisites not finished');   // desktop keeps the chip
    expect(open.querySelector('.topic-lock, .chip-lock')).toBeNull();

    // Line 2 on phones: status and duration, then the "mark as completed" button with its label.
    expect(locked.querySelector('.chips .topic-badge-sm')?.textContent).toBe('Not started');
    expect(locked.querySelector('.topic-actions button')?.getAttribute('aria-label')).toBe('Mark as completed: Topic 1');
  });
});

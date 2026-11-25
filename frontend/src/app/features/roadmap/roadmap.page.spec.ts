import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Phase, Roadmap, TopicSummary } from '../../core/models';
import RoadmapPage from './roadmap.page';

const phase = (id: number, percent: number, extra: Partial<Phase> = {}): Phase => ({
  id, slug: 'p' + id, order: id, titleEn: 'Phase ' + id, titleAr: 'مرحلة ' + id, descriptionEn: '', descriptionAr: '',
  topicCount: 2, doneCount: percent >= 100 ? 2 : 0, percent, remainingMinutes: 0, topics: [], projects: [], guidedProjects: [], position: id, sharedWith: [], ...extra,
});

async function render(data: Roadmap, api: Partial<ApiService> = {}): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { roadmap: () => Promise.resolve(data), ...api } }] });
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
  it('offers a certificate only for a finished phase and opens its page', async () => {
    const issued: number[] = [];
    const el = await render({ currentPhaseId: 2, trackSlug: null, phases: [phase(1, 100), phase(2, 40), phase(3, 100, { topicCount: 0 })] }, {
      issueCertificate: (phaseId: number) => { issued.push(phaseId); return Promise.resolve({ code: 'ABCDEFGHJKMN', phaseId, issuedAt: '2026-11-23T10:00:00Z' }); },
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const [done, open, empty] = [...el.querySelectorAll('.phase')];
    const button = done.querySelector<HTMLButtonElement>('.phase-cert button')!;
    expect(button.textContent).toContain('Get your certificate');
    // Not inside the header button, and absent for unfinished or empty phases.
    expect(button.closest('.phase-head')).toBeNull();
    expect(open.querySelector('.phase-cert')).toBeNull();
    expect(empty.querySelector('.phase-cert')).toBeNull();

    button.click();
    await new Promise(r => setTimeout(r, 0));
    expect(issued).toEqual([1]);
    expect(navigate).toHaveBeenCalledWith(['/c', 'ABCDEFGHJKMN']);
  });

  it('marks a finished phase and lists its library and main projects inside it', async () => {
    const el = await render({
      currentPhaseId: 1, trackSlug: null,
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
    const el = await render({ currentPhaseId: 1, trackSlug: null, phases: [phase(1, 0, { topics: [topic(1, false), topic(2, true)] })] });
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

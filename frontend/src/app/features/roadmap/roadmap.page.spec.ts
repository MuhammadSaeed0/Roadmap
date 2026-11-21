import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Phase, Roadmap } from '../../core/models';
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
});

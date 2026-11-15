import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { GuidedProjectDetail, GuidedStep } from '../../core/models';
import GuideDetailPage from './guide-detail.page';

const step = (id: number, done: boolean): GuidedStep => ({
  id, key: 's' + id, order: id, titleEn: 'Step ' + id, titleAr: 'خطوة ' + id, bodyEn: 'Do it.', bodyAr: 'نفّذها.',
  code: null, codeLanguage: null, hintsEn: ['h'], hintsAr: ['ت'], done, completedAt: null,
});

const project = (done: boolean, repositoryUrl: string | null = null): GuidedProjectDetail => ({
  id: 5, key: 'cs-todo-console', skill: 'CSharp', level: 'Beginner', estimatedHours: 4,
  titleEn: 'To-do list', titleAr: 'قائمة مهام', summaryEn: 'S', summaryAr: 'م', techStack: 'C# · .NET console',
  goalsEn: [], goalsAr: [], requirementsEn: [], requirementsAr: [], acceptanceEn: [], acceptanceAr: [], stretchEn: [], stretchAr: [],
  steps: [step(1, true), step(2, done)], sameSkill: [], repositoryUrl,
});

async function render(data: GuidedProjectDetail, saved: (string | null)[] = []): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: {
        guidedProject: () => Promise.resolve(data),
        setGuidedRepository: (_: number, url: string | null) => { saved.push(url); return Promise.resolve(); },
      } },
    ],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(GuideDetailPage);
  fixture.componentRef.setInput('id', '5');
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('GuideDetailPage', () => {
  it('asks for the repository only once every step is done', async () => {
    expect((await render(project(false))).querySelector('[data-tour="guide-repo"]')).toBeNull();
    TestBed.resetTestingModule();
    const el = await render(project(true, 'https://github.com/me/todo'));
    const card = el.querySelector('[data-tour="guide-repo"]')!;
    expect(card.textContent).toContain('Your repository');
    expect(card.querySelector<HTMLInputElement>('input')!.value).toBe('https://github.com/me/todo');
  });

  it('saves the link and refuses one that is not a web address', async () => {
    const saved: (string | null)[] = [];
    const el = await render(project(true), saved);
    const input = el.querySelector<HTMLInputElement>('[data-tour="guide-repo"] input')!;
    const form = el.querySelector<HTMLFormElement>('[data-tour="guide-repo"] form')!;

    input.value = 'not a link';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    expect(saved).toEqual([]);

    input.value = 'https://github.com/me/todo';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    await Promise.resolve();
    expect(saved).toEqual(['https://github.com/me/todo']);
  });
});

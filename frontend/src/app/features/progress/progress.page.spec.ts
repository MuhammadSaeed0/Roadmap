import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, provideRouter, Router, UrlTree } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { StudySession } from '../../core/models';
import { ConfirmService } from '../../core/ui-services';
import ProgressPage from './progress.page';
import { progressOverviewRedirect } from './progress-redirect';

const never = () => new Promise<never>(() => undefined);
const session = (id: number, topic: string | null): StudySession => ({
  id, topicId: topic ? id : null, topicTitleEn: topic, topicTitleAr: topic, projectTaskId: null, taskTitleEn: null, taskTitleAr: null,
  plannedMinutes: null, actualMinutes: 45, sessionDate: '2026-11-10', note: null, createdAt: '2026-11-10T10:00:00Z',
});

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) { await fixture.whenStable(); fixture.detectChanges(); }
}

async function render(confirmAnswer: boolean, deleted: number[]): Promise<{ el: HTMLElement; fixture: ComponentFixture<ProgressPage> }> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: {
        weekly: never, reviews: never,
        sessions: () => Promise.resolve([session(1, 'LINQ'), session(2, null)]),
        deleteSession: (id: number) => { deleted.push(id); return Promise.resolve(); },
      } },
      { provide: ConfirmService, useValue: { ask: () => Promise.resolve(confirmAnswer) } },
    ],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(ProgressPage);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  el.querySelector<HTMLButtonElement>('#tab-sessions')!.click();
  await settle(fixture);
  return { el, fixture };
}

describe('ProgressPage', () => {
  it('has the weekly review, the review queue and the study sessions, without the old overview', async () => {
    const { el } = await render(true, []);
    expect([...el.querySelectorAll('[role="tab"]')].map(t => t.textContent?.trim())).toEqual(['Weekly review', 'Review queue', 'Study sessions']);
  });

  it('lists study sessions and deletes one only after confirming', async () => {
    const deleted: number[] = [];
    const { el, fixture } = await render(false, deleted);
    const rows = () => [...el.querySelectorAll('#panel-sessions .review-item')];
    expect(rows().length).toBe(2);
    expect(rows()[0].textContent).toContain('LINQ');
    expect(rows()[1].textContent).toContain('General study');

    rows()[0].querySelector<HTMLButtonElement>('button')!.click();
    await settle(fixture);
    expect(deleted).toEqual([]);
    expect(rows().length).toBe(2);
  });

  it('removes the session from the list once deleted', async () => {
    const deleted: number[] = [];
    const { el, fixture } = await render(true, deleted);
    el.querySelector<HTMLButtonElement>('#panel-sessions .review-item button')!.click();
    await settle(fixture);
    expect(deleted).toEqual([1]);
    expect(el.querySelectorAll('#panel-sessions .review-item').length).toBe(1);
  });

  it('sends old overview links to the Progress tab of the Developer Level page', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const snapshot = (tab: string | null) => ({ queryParamMap: convertToParamMap(tab ? { tab } : {}) }) as ActivatedRouteSnapshot;
    const run = (tab: string | null) => TestBed.runInInjectionContext(() => progressOverviewRedirect(snapshot(tab), {} as never));
    expect(TestBed.inject(Router).serializeUrl(run('overview') as UrlTree)).toBe('/skills?tab=progress');
    expect(run('review')).toBe(true);
    expect(run(null)).toBe(true);
  });
});

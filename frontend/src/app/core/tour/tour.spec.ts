import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route, provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { Account, AuthService } from '../auth.service';
import { content as ar } from './tour-content.ar';
import { content as en } from './tour-content.en';
import { HELP_IDS, MAIN_TOUR, PAGE_HELP, SECTION_IDS, isHelpId } from './tour.config';
import { TourService } from './tour.service';

function fakeAuth(id: string | null, isAdmin = false) {
  const account = signal<Account | null>(id ? {
    id, email: `${id}@example.com`, fullName: 'Test', createdAt: '', status: 'Approved', emailVerified: true,
    isAdmin, isOwner: false, statusReason: null,
  } : null);
  const approved = computed(() => account()?.status === 'Approved');
  return { account, approved, isAdmin: computed(() => approved() && !!account()?.isAdmin) };
}

async function createService(id: string | null = 'user-1', isAdmin = false): Promise<TourService> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth(id, isAdmin) }] });
  const service = TestBed.inject(TourService);
  TestBed.tick();   // runs the effects that read the saved progress
  await service.ensureContent();
  return service;
}

describe('tour configuration', () => {
  it('gives every app page a guide and every guide a page', () => {
    const shell = routes.filter(r => r.path !== '**' && r.data?.['layout'] !== 'auth' && r.path !== 'change-password');
    const used = new Set<string>();
    for (const route of shell as Route[]) {
      const helpId = route.data?.['helpId'];
      expect(isHelpId(helpId), `route "${route.path}" needs a data.helpId`).toBe(true);
      used.add(helpId);
    }
    expect([...used].sort()).toEqual([...HELP_IDS].sort());
  });

  it('only refers to known sections', () => {
    const known = new Set<string>(SECTION_IDS);
    for (const ids of Object.values(PAGE_HELP)) ids.forEach(id => expect(known.has(id)).toBe(true));
    for (const step of MAIN_TOUR) (step.targets ?? []).forEach(id => expect(known.has(id)).toBe(true));
  });

  it('has text for every section and page in both languages', () => {
    for (const c of [en, ar]) {
      for (const id of SECTION_IDS) {
        expect(c.sections[id].title.trim(), id).not.toBe('');
        expect(c.sections[id].body.trim(), id).not.toBe('');
      }
      for (const id of HELP_IDS) expect(c.pages[id].summary.trim(), id).not.toBe('');
    }
    expect(ar.ui.welcomePoints.length).toBe(en.ui.welcomePoints.length);
    expect(ar.tips.length).toBe(en.tips.length);
  });
});

describe('TourService', () => {
  beforeEach(() => localStorage.clear());

  it('greets a new account once and remembers a skipped welcome', async () => {
    let tour = await createService();
    expect(tour.progress().status).toBe('new');
    expect(tour.showWelcome()).toBe(true);

    tour.dismissWelcome('skipped');
    expect(tour.showWelcome()).toBe(false);

    tour = await createService();   // a refresh
    expect(tour.progress().status).toBe('skipped');
    expect(tour.showWelcome()).toBe(false);
  });

  it('keeps progress per account', async () => {
    (await createService('user-1')).dismissWelcome('dismissed');
    expect((await createService('user-2')).progress().status).toBe('new');
    expect((await createService('user-1')).progress().status).toBe('dismissed');
  });

  it('moves through the tour and resumes where it was closed, after a refresh', async () => {
    let tour = await createService();
    await tour.startTour();
    expect(tour.run()?.kind).toBe('tour');
    expect(tour.current()?.key).toBe('welcome');

    tour.next();
    tour.next();
    tour.back();
    expect(tour.run()?.index).toBe(1);
    tour.close();
    expect(tour.run()).toBeNull();

    tour = await createService();
    expect(tour.canResume()).toBe(true);
    expect(tour.showWelcome()).toBe(false);   // only first-time users are greeted
    await tour.resumeTour();
    expect(tour.run()?.index).toBe(1);
  });

  it('marks the tour completed after the last step, and skipped when skipped', async () => {
    const tour = await createService();
    await tour.startTour(tour.tourLength() - 1);
    expect(tour.current()?.key).toBe('finish');
    tour.next();
    expect(tour.run()).toBeNull();
    expect(tour.progress().status).toBe('completed');

    await tour.startTour();
    tour.skip();
    expect(tour.progress().status).toBe('skipped');
  });

  it('shows the admin step only to administrators', async () => {
    const user = await createService('user-1', false);
    await user.startTour();
    expect(user.run()!.steps.some(s => s.key === 'admin-stats')).toBe(false);

    const admin = await createService('admin-1', true);
    await admin.startTour();
    expect(admin.run()!.steps.some(s => s.key === 'admin-stats')).toBe(true);
    expect(admin.tourLength()).toBe(user.tourLength() + 1);
  });

  it('walks only through the parts of a page that are on screen, from a chosen part', async () => {
    const tour = await createService();
    const present = ['dashboard-hero', 'dashboard-plan', 'dashboard-skills'];
    const nodes = present.map(id => {
      const el = document.createElement('section');
      el.setAttribute('data-tour', id);
      document.body.appendChild(el);
      return el;
    });
    try {
      await tour.startPage('dashboard', 'dashboard-plan');
      expect(tour.run()!.steps.map(s => s.key)).toEqual(present);
      expect(tour.current()?.key).toBe('dashboard-plan');
      expect(tour.current()?.text).toEqual(en.sections['dashboard-plan']);

      // A page guide doesn't touch the first-run tour's progress.
      tour.next();
      tour.next();
      expect(tour.run()).toBeNull();
      expect(tour.progress().status).toBe('new');
    } finally {
      nodes.forEach(n => n.remove());
    }
  });

  it('explains a single picked section and leaves pick mode', async () => {
    const tour = await createService();
    await tour.startPicking();
    expect(tour.picking()).toBe(true);
    await tour.explainSection('search');
    expect(tour.picking()).toBe(false);
    expect(tour.run()?.kind).toBe('section');
    expect(tour.current()?.text.title).toBe(en.sections.search.title);
  });

  it('fills in placeholders', async () => {
    const tour = await createService();
    expect(tour.format(en.ui.stepOf, { n: 3, total: 12 })).toBe('Step 3 of 12');
  });
});

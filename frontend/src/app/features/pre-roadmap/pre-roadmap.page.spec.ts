import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { PathSummary, Roadmap } from '../../core/models';
import PreRoadmapPage from './pre-roadmap.page';

// Only what the page reads: slugs, ids and titles. The frontend phase is missing on purpose (its link is hidden).
const roadmap = {
  currentPhaseId: null,
  phases: [
    { id: 8, slug: 'angular', titleEn: 'Angular', titleAr: 'أنجولار', topics: [] },
    { id: 4, slug: 'aspnet-core', titleEn: 'ASP.NET Core Web API', titleAr: 'ASP.NET Core Web API', topics: [
      { id: 61, slug: 'api-http-rest', titleEn: 'HTTP and REST', titleAr: 'HTTP و REST' },
    ] },
  ],
} as unknown as Roadmap;
const paths = [{ id: 4, slug: 'frontend-developer', nameEn: 'Frontend Developer', nameAr: 'مطوّر الواجهات' }] as PathSummary[];

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) { await fixture.whenStable(); fixture.detectChanges(); }
}

async function render(lang: 'en' | 'ar' = 'en'): Promise<{ el: HTMLElement; fixture: ComponentFixture<PreRoadmapPage> }> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ApiService, useValue: { roadmap: () => Promise.resolve(roadmap), paths: () => Promise.resolve(paths) } }],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(PreRoadmapPage);
  fixture.detectChanges();
  await settle(fixture);
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

const fieldCards = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('.pre-field-card')];
const type = (input: HTMLInputElement, value: string) => { input.value = value; input.dispatchEvent(new Event('input')); };

describe('PreRoadmapPage', () => {
  beforeEach(() => {
    for (const key of Object.keys(localStorage)) if (key.startsWith('devpath.')) localStorage.removeItem(key);
  });
  afterEach(() => {
    for (const key of Object.keys(localStorage)) if (key.startsWith('devpath.')) localStorage.removeItem(key);
  });

  it('shows the four sections, the intro questions and all eleven fields', async () => {
    const { el } = await render();
    for (const id of ['pre-intro', 'pre-fields', 'pre-fundamentals', 'pre-next']) expect(el.querySelector(`#${id}`), id).toBeTruthy();
    expect([...el.querySelectorAll('.pre-step-name')].map(s => s.textContent?.trim()))
      .toEqual(['Understand programming', 'Explore the fields', 'Learn the fundamentals', 'Choose your roadmap']);
    expect(el.querySelectorAll('.pre-question').length).toBe(5);
    expect(el.querySelector('.pre-question-body')?.textContent).toContain('step-by-step instructions');
    expect(fieldCards(el).length).toBe(11);
    expect(el.querySelectorAll('#pre-intro app-video-card').length).toBeGreaterThan(3);
  });

  it('filters fields by type and by search in either language', async () => {
    const { el, fixture } = await render();
    [...el.querySelectorAll<HTMLButtonElement>('#pre-fields .segmented button')].find(b => b.textContent?.includes('Data & AI'))!.click();
    await settle(fixture);
    expect(fieldCards(el).map(c => c.querySelector('.pre-field-title')?.textContent?.trim()))
      .toEqual(['Artificial intelligence & machine learning', 'Data science & data analysis']);

    [...el.querySelectorAll<HTMLButtonElement>('#pre-fields .segmented button')][0].click();
    type(el.querySelector<HTMLInputElement>('#pre-field-search')!, 'flutter');
    await settle(fixture);
    expect(fieldCards(el).length).toBe(1);
    type(el.querySelector<HTMLInputElement>('#pre-field-search')!, 'الأمن');
    await settle(fixture);
    expect(fieldCards(el)[0].textContent).toContain('Cybersecurity');

    type(el.querySelector<HTMLInputElement>('#pre-field-search')!, 'nothing-matches-this');
    await settle(fixture);
    expect(el.textContent).toContain('No field matches this search.');
  });

  it('opens a field with what to learn first, and links to this site only where the slug exists', async () => {
    const { el, fixture } = await render();
    fieldCards(el)[0].click();
    await settle(fixture);
    const detail = el.querySelector('#pre-field-detail')!;
    expect(detail.querySelector('h3')?.textContent).toContain('Frontend development');
    expect(detail.textContent).toContain('Learn these first');
    expect(detail.querySelectorAll('.pre-start li').length).toBe(3);
    const links = [...detail.querySelectorAll<HTMLAnchorElement>('.pre-link')];
    // typescript (phase) is not in the mocked roadmap, so only Angular and the path are linked.
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/roadmap#phase-8', '/paths/4']);
    expect(detail.querySelectorAll('app-video-card').length).toBeGreaterThan(0);
    // Curated videos have no watched/saved buttons here, only the YouTube link.
    expect(detail.querySelector('app-video-card button[aria-pressed]')).toBeNull();
    expect(fieldCards(el)[0].getAttribute('aria-expanded')).toBe('true');

    detail.querySelector<HTMLButtonElement>('.pre-detail-head .icon-btn')!.click();
    await settle(fixture);
    expect(el.querySelector('#pre-field-detail')).toBeNull();
  });

  it('remembers which fundamentals are understood and links them to roadmap topics', async () => {
    const { el, fixture } = await render();
    const items = () => [...el.querySelectorAll('.pre-fundamental')];
    expect(items().length).toBe(17);
    expect(el.querySelector('.pre-progress')?.textContent).toContain('0 of 17 understood');

    const http = items().find(i => i.textContent?.includes('APIs & HTTP basics'))!;
    http.querySelector<HTMLButtonElement>('.pre-check')!.click();
    http.querySelector<HTMLButtonElement>('.pre-toggle')!.click();
    await settle(fixture);
    expect(el.querySelector('.pre-progress')?.textContent).toContain('1 of 17 understood');
    expect(JSON.parse(localStorage.getItem('devpath.preRoadmap.understood')!)).toEqual(['http']);
    expect(http.querySelector<HTMLAnchorElement>('.pre-link')?.getAttribute('href')).toBe('/topics/61');
    expect(http.querySelectorAll('app-video-card').length).toBe(2);
  });

  it('applies one language choice to all its videos', async () => {
    const { el, fixture } = await render();
    const before = el.querySelectorAll('#pre-intro app-video-card').length;
    [...el.querySelectorAll<HTMLButtonElement>('.pre-lang [role="radio"]')].find(b => b.textContent?.includes('Arabic'))!.click();
    await settle(fixture);
    const cards = [...el.querySelectorAll('#pre-intro app-video-card')];
    expect(cards.length).toBeLessThan(before);
    expect(cards.every(c => c.querySelector('.video-lang')?.textContent?.includes('Arabic'))).toBe(true);
  });

  it('is fully translated in Arabic', async () => {
    const { el } = await render('ar');
    expect(el.querySelector('h1')?.textContent).toContain('قبل خارطة الطريق');
    expect(el.querySelector('#pre-fields h2')?.textContent).toContain('مجالات البرمجة');
    expect(fieldCards(el)[0].textContent).toContain('تطوير الواجهات الأمامية');
    expect(el.querySelector('.pre-question-body')?.textContent).toContain('تعليمات دقيقة');
  });
});

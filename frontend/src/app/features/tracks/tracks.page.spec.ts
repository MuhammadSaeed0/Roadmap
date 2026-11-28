import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Track, Tracks } from '../../core/models';
import { trackChoiceGuard } from '../../core/track.guard';
import { TrackStore } from '../../core/track.service';
import TracksPage from './tracks.page';

const track = (slug: string, extra: Partial<Track> = {}): Track => ({
  slug, order: 1, titleEn: slug === 'dotnet' ? '.NET full-stack developer' : 'AI application developer',
  titleAr: slug === 'dotnet' ? 'مطوّر Full-Stack بـ .NET' : 'مطوّر تطبيقات الذكاء الاصطناعي',
  summaryEn: 'Summary ' + slug, summaryAr: 'ملخص ' + slug, outcomeEn: 'Outcome ' + slug, outcomeAr: 'النتيجة ' + slug,
  technologies: ['C#', 'Angular'], icon: 'layers', isDraft: false, phaseCount: 14, topicCount: 166, minutes: 6000,
  doneTopics: 0, sharedPhases: 0, phaseIds: [], ...extra,
});

async function render(lang: 'en' | 'ar', data: Tracks, query: Record<string, string> = {}) {
  const chosen: string[] = [];
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: {
        tracks: () => Promise.resolve(data),
        chooseTrack: (slug: string) => { chosen.push(slug); return Promise.resolve({ ...data, activeSlug: slug, chosenSlug: slug }); },
      } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
    ],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(TracksPage);
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise(r => setTimeout(r, 0));
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, chosen, navigate, fixture };
}

describe('TracksPage', () => {
  const both: Tracks = {
    tracks: [track('dotnet', { doneTopics: 40 }), track('ai', { order: 2, phaseCount: 13, topicCount: 100, sharedPhases: 4, icon: 'sparkle' })],
    activeSlug: 'dotnet', chosenSlug: 'dotnet',
  };

  it('shows a card per roadmap with its technologies, size, progress and shared phases', async () => {
    const { el } = await render('en', both);
    const cards = [...el.querySelectorAll('.track')];
    expect(cards.length).toBe(2);
    expect(cards[0].classList).toContain('active');
    expect(cards[0].textContent).toContain('Your roadmap');
    expect(cards[0].textContent).toContain('40 of 166 topics done');
    expect(cards[0].querySelector('a[href="/roadmap"]')).not.toBeNull();
    expect([...cards[0].querySelectorAll('.tech li')].map(li => li.textContent?.trim())).toEqual(['C#', 'Angular']);
    expect(cards[1].textContent).toContain('4 phases shared with your roadmap');
    expect(cards[1].querySelector('button')?.textContent).toContain('Follow this roadmap');
  });

  it('switches roadmap and goes back where the learner was heading, never to another site', async () => {
    const { el, chosen, navigate, fixture } = await render('en', both, { returnUrl: '/practice' });
    el.querySelectorAll<HTMLButtonElement>('.track button')[0].click();
    await new Promise(r => setTimeout(r, 0));
    expect(chosen).toEqual(['ai']);
    expect(navigate).toHaveBeenCalledWith('/practice');

    TestBed.resetTestingModule();
    const evil = await render('en', both, { returnUrl: '//evil.example' });
    evil.el.querySelectorAll<HTMLButtonElement>('.track button')[0].click();
    await new Promise(r => setTimeout(r, 0));
    expect(evil.navigate).toHaveBeenCalledWith('/roadmap');
  });

  it('explains the first choice in Arabic, keeping technology names left-to-right', async () => {
    const { el } = await render('ar', { ...both, chosenSlug: null }, { first: '1' });
    expect(el.querySelector('h1')?.textContent).toContain('أي خارطة طريق تريد أن تتبعها؟');
    expect(el.querySelector('.tech bdi')?.getAttribute('dir')).toBe('ltr');
  });
});

describe('trackChoiceGuard', () => {
  async function run(data: Tracks, approved = true) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { tracks: () => Promise.resolve(data) } },
        { provide: AuthService, useValue: { approved: () => approved, account: () => ({ id: 'u' }), restore: () => Promise.resolve() } },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/roadmap');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const allowed = TestBed.runInInjectionContext(() => trackChoiceGuard({} as never, { url: '/roadmap' } as never));
    await TestBed.inject(TrackStore).load();
    await new Promise(r => setTimeout(r, 10));
    return { allowed, navigate };
  }

  it('opens the page at once and sends a new learner with a real choice to the picker', async () => {
    const { allowed, navigate } = await run({ tracks: [track('dotnet'), track('ai')], activeSlug: 'dotnet', chosenSlug: null });
    expect(allowed).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/tracks'], { queryParams: { first: 1, returnUrl: '/roadmap' }, replaceUrl: true });
  });

  it('leaves learners alone when they chose already or there is only one published roadmap', async () => {
    expect((await run({ tracks: [track('dotnet'), track('ai')], activeSlug: 'ai', chosenSlug: 'ai' })).navigate).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    expect((await run({ tracks: [track('dotnet'), track('ai', { isDraft: true })], activeSlug: 'dotnet', chosenSlug: null })).navigate).not.toHaveBeenCalled();
  });
});

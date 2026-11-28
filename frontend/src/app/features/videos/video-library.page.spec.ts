import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SkillArea, Track, TopicVideo, VideoLibrary } from '../../core/models';
import VideoLibraryPage, { roadmapSections } from './video-library.page';

const track = (slug: string, order: number, phaseIds: number[]): Track => ({
  slug, order, titleEn: slug, titleAr: slug, summaryEn: '', summaryAr: '', outcomeEn: '', outcomeAr: '', technologies: [], icon: 'map',
  isDraft: false, phaseCount: phaseIds.length, topicCount: 0, minutes: 0, doneTopics: 0, sharedPhases: 0, phaseIds,
});
const video = (id: string, language: 'Arabic' | 'English' = 'English'): TopicVideo => ({
  videoId: id, title: 'Video ' + id, channelTitle: 'Channel', publishedAt: null, durationSeconds: null, source: 'suggested', addedId: null,
  isWatched: false, isBookmarked: false, language,
});
const phase = (id: number, order: number, skill: SkillArea, videoId: string) => ({
  id, order, titleEn: 'Phase ' + id, titleAr: 'Phase ' + id,
  topics: [{ id: id * 10, slug: 't' + id, titleEn: 'Topic ' + id, titleAr: 'Topic ' + id, skill, videos: [video(videoId)] }],
});

// .NET holds phases 1-2, Android phases 19-20 (global order); each must be numbered from 1.
const library: VideoLibrary = {
  phases: [phase(1, 1, 'CSharp', 'aaaaaaaaaaa'), phase(2, 2, 'Angular', 'bbbbbbbbbbb'), phase(19, 19, 'Kotlin', 'ccccccccccc'), phase(20, 20, 'Android', 'ddddddddddd')],
  englishCount: 4, arabicCount: 0, watchedCount: 0,
};
const tracks = [track('dotnet-fullstack', 1, [1, 2]), track('android-developer', 3, [19, 20])];

async function render(activeSlug = 'android-developer') {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ApiService, useValue: {
      videoLibrary: () => Promise.resolve(library), savedVideos: () => Promise.resolve([]),
      tracks: () => Promise.resolve({ tracks, activeSlug, chosenSlug: activeSlug }),
    } }],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(VideoLibraryPage);
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) { await fixture.whenStable(); await new Promise(r => setTimeout(r)); fixture.detectChanges(); }
  return { fixture, el: fixture.nativeElement as HTMLElement };
}
const button = (el: HTMLElement, label: string) => [...el.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.trim() === label)!;
const eyebrows = (el: HTMLElement) => [...el.querySelectorAll('.phase-eyebrow')].map(e => e.textContent?.trim());
const chips = (el: HTMLElement) => [...el.querySelectorAll('.chip-wrap .chip')].map(e => e.textContent?.trim());

describe('Video library', () => {
  it('numbers every roadmap from Phase 1 and shows a shared phase once', () => {
    const sections = roadmapSections(library.phases, tracks, '');
    expect(sections.map(s => s.phases.map(p => p.number))).toEqual([[1, 2], [1, 2]]);
    expect(roadmapSections(library.phases, tracks, 'android-developer')[0].phases.map(p => [p.id, p.number])).toEqual([[19, 1], [20, 2]]);
    const shared = roadmapSections(library.phases, [...tracks, track('ai', 2, [1, 2, 19])], '');
    expect(shared.map(s => s.phases.map(p => p.id))).toEqual([[1, 2], [19, 20]]);
  });

  it('filters by roadmap in the browser, with only that roadmap’s skills, and clears a skill it lacks', async () => {
    const { fixture, el } = await render();
    // The learner's roadmap by default.
    expect(eyebrows(el)).toEqual(['Phase 1', 'Phase 2']);
    expect(el.textContent).toContain('Topic 19');
    expect(el.querySelector('.roadmap-heading')).toBeNull();
    expect(el.textContent).not.toContain('Phase 1Topic');
    expect(chips(el)).toEqual(['All skills', 'Kotlin', 'Android apps']);

    button(el, 'All roadmaps').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.roadmap-heading').length).toBe(2);
    button(el, 'C#').click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Topic 1');

    // Android has no C# videos: the skill resets instead of hiding everything.
    button(el, 'android-developer').click();
    fixture.detectChanges();
    expect(el.querySelector('.chip-wrap .chip.active')?.textContent?.trim()).toBe('All skills');
    expect(el.textContent).toContain('Topic 19');
  });
});

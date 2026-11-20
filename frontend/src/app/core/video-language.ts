import { InjectionToken, Injectable, Provider, computed, inject, signal } from '@angular/core';
import { I18nService } from './i18n/i18n.service';
import { TopicVideo, VideoLanguage } from './models';

export type VideoLanguageFilter = VideoLanguage | 'all';

/** Where the language choice applies. Each place keeps its own choice, so filtering one never changes another. */
export type VideoLanguageScope = 'library' | 'topic' | 'preRoadmap';
export const VIDEO_LANGUAGE_SCOPE = new InjectionToken<VideoLanguageScope>('VIDEO_LANGUAGE_SCOPE');

/** Gives a component its own language choice: add to its `providers`. */
export function provideVideoLanguage(scope: VideoLanguageScope): Provider[] {
  return [VideoLanguageService, { provide: VIDEO_LANGUAGE_SCOPE, useValue: scope }];
}

/**
 * Which language of curated videos to show (Arabic, English or both), remembered in this browser per place:
 * the video library keeps one choice, and each topic (or project task) keeps its own, so filtering one never
 * changes another. Until the learner chooses, both languages are shown with the interface language first.
 */
@Injectable()
export class VideoLanguageService {
  private readonly i18n = inject(I18nService);
  private readonly scope = inject(VIDEO_LANGUAGE_SCOPE);
  /** One topic or task inside the scope, set by the component; null for the whole scope (the library). */
  private readonly place = signal<string | null>(null);
  private readonly key = computed(() => `devpath.videoLanguage.${this.scope}${this.place() === null ? '' : `.${this.place()}`}`);
  /** The choice made on this visit; the stored one is read again when the place changes. */
  private readonly chosen = signal<{ key: string; value: VideoLanguageFilter } | null>(null);
  readonly filter = computed<VideoLanguageFilter>(() => {
    const key = this.key();
    const chosen = this.chosen();
    return chosen?.key === key ? chosen.value : read(key);
  });

  setPlace(place: string | null): void {
    this.place.set(place);
  }

  set(filter: VideoLanguageFilter): void {
    const key = this.key();
    this.chosen.set({ key, value: filter });
    try { localStorage.setItem(key, filter); } catch { /* not remembered */ }
  }

  /** Filters by the chosen language (videos without a language, such as ones you added, always stay) and sorts the interface language first. */
  apply<T extends Pick<TopicVideo, 'language'>>(videos: T[]): T[] {
    const filter = this.filter();
    const preferred: VideoLanguage = this.i18n.lang() === 'ar' ? 'Arabic' : 'English';
    const shown = filter === 'all' ? videos : videos.filter(v => !v.language || v.language === filter);
    const rank = (v: T) => (v.language === preferred ? 0 : v.language ? 1 : 2);
    return [...shown].sort((a, b) => rank(a) - rank(b));
  }
}

function read(key: string): VideoLanguageFilter {
  try {
    const value = localStorage.getItem(key);
    return value === 'Arabic' || value === 'English' ? value : 'all';
  } catch {
    return 'all';
  }
}

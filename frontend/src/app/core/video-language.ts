import { Injectable, inject, signal } from '@angular/core';
import { I18nService } from './i18n/i18n.service';
import { TopicVideo, VideoLanguage } from './models';

export type VideoLanguageFilter = VideoLanguage | 'all';
const KEY = 'devpath.videoLanguage';

/**
 * Which language of curated videos to show (Arabic, English or both), remembered in this browser.
 * Until the learner chooses, both languages are shown with the interface language first.
 */
@Injectable({ providedIn: 'root' })
export class VideoLanguageService {
  private readonly i18n = inject(I18nService);
  readonly filter = signal<VideoLanguageFilter>(read());

  set(filter: VideoLanguageFilter): void {
    this.filter.set(filter);
    try { localStorage.setItem(KEY, filter); } catch { /* not remembered */ }
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

function read(): VideoLanguageFilter {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'Arabic' || value === 'English' ? value : 'all';
  } catch {
    return 'all';
  }
}

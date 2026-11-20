import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n/i18n.service';
import { VideoLanguageScope, VideoLanguageService, provideVideoLanguage } from './video-language';

function service(scope: VideoLanguageScope, place: string | null = null): VideoLanguageService {
  const injector = Injector.create({ providers: provideVideoLanguage(scope), parent: TestBed.inject(Injector) });
  const languages = injector.get(VideoLanguageService);
  languages.setPlace(place);
  return languages;
}

describe('VideoLanguageService', () => {
  beforeEach(() => {
    for (const key of Object.keys(localStorage)) if (key.startsWith('devpath.videoLanguage')) localStorage.removeItem(key);
    TestBed.inject(I18nService).lang.set('en');
  });

  it('keeps the video library choice separate from the topic pages', () => {
    const library = service('library');
    const topic = service('topic', '7');
    library.set('Arabic');
    expect(library.filter()).toBe('Arabic');
    expect(topic.filter()).toBe('all');
    // Remembered per place for the next visit.
    expect(service('library').filter()).toBe('Arabic');
    expect(service('topic', '7').filter()).toBe('all');
  });

  it('gives each topic page its own choice', () => {
    const first = service('topic', '7');
    first.set('English');
    expect(service('topic', '8').filter()).toBe('all');
    expect(service('topic', '7').filter()).toBe('English');

    // Moving from one topic to another (same component) reads that topic's choice.
    first.setPlace('8');
    expect(first.filter()).toBe('all');
    first.set('Arabic');
    first.setPlace('7');
    expect(first.filter()).toBe('English');
    expect(service('topic', '8').filter()).toBe('Arabic');
  });

  it('filters by the chosen language and keeps videos without one', () => {
    const topic = service('topic', '7');
    topic.set('English');
    const shown = topic.apply([{ language: 'Arabic' }, { language: 'English' }, { language: null }]);
    expect(shown.map(v => v.language)).toEqual(['English', null]);
  });
});

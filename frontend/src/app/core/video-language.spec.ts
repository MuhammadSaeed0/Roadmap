import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n/i18n.service';
import { VideoLanguageScope, VideoLanguageService, provideVideoLanguage } from './video-language';

function service(scope: VideoLanguageScope): VideoLanguageService {
  const injector = Injector.create({ providers: provideVideoLanguage(scope), parent: TestBed.inject(Injector) });
  return injector.get(VideoLanguageService);
}

describe('VideoLanguageService', () => {
  beforeEach(() => {
    localStorage.removeItem('devpath.videoLanguage.library');
    localStorage.removeItem('devpath.videoLanguage.topic');
    TestBed.inject(I18nService).lang.set('en');
  });

  it('keeps the video library choice separate from the topic pages', () => {
    const library = service('library');
    const topic = service('topic');
    library.set('Arabic');
    expect(library.filter()).toBe('Arabic');
    expect(topic.filter()).toBe('all');
    // Remembered per place for the next visit.
    expect(service('library').filter()).toBe('Arabic');
    expect(service('topic').filter()).toBe('all');
  });

  it('filters by the chosen language and keeps videos without one', () => {
    const topic = service('topic');
    topic.set('English');
    const shown = topic.apply([{ language: 'Arabic' }, { language: 'English' }, { language: null }]);
    expect(shown.map(v => v.language)).toEqual(['English', null]);
  });
});

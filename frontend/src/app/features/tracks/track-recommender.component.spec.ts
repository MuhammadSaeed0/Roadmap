import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Track } from '../../core/models';
import { TrackRecommenderComponent } from './track-recommender.component';

const track = (slug: string, order: number, extra: Partial<Track> = {}): Track => ({
  slug, order, titleEn: slug === 'dotnet-fullstack' ? '.NET full-stack developer' : 'AI application developer',
  titleAr: slug === 'dotnet-fullstack' ? 'مطوّر Full-Stack بـ .NET' : 'مطوّر تطبيقات الذكاء الاصطناعي',
  summaryEn: 'S', summaryAr: 'م', outcomeEn: 'O', outcomeAr: 'ن', technologies: ['C#'], icon: 'map', isDraft: false,
  phaseCount: 10, topicCount: 80, minutes: 600, doneTopics: 0, sharedPhases: 0, ...extra,
});

async function render(tracks: Track[], mode: 'cards' | 'quiz', lang: 'en' | 'ar' = 'en') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { tracks: () => Promise.resolve({ tracks, activeSlug: null, chosenSlug: null }) } },
      { provide: AuthService, useValue: { account: () => null } },
    ],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(TrackRecommenderComponent);
  fixture.componentRef.setInput('mode', mode);
  fixture.detectChanges();
  await new Promise(r => setTimeout(r, 0));
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

describe('TrackRecommenderComponent', () => {
  it('shows nothing while there is only one published roadmap (drafts never count)', async () => {
    const { el } = await render([track('dotnet-fullstack', 1), track('ai-app-developer', 2, { isDraft: true })], 'cards');
    expect(el.textContent?.trim()).toBe('');
  });

  it('lists the roadmaps for visitors, each leading to sign-up', async () => {
    const { el } = await render([track('dotnet-fullstack', 1), track('ai-app-developer', 2)], 'cards');
    expect(el.querySelectorAll('.tr-card').length).toBe(2);
    expect(el.querySelector('.tr-card a')?.getAttribute('href')).toBe('/sign-up');
  });

  it('recommends a roadmap from two answers, in Arabic', async () => {
    const { el, fixture } = await render([track('dotnet-fullstack', 1), track('ai-app-developer', 2)], 'quiz', 'ar');
    const fieldsets = el.querySelectorAll('fieldset');
    fieldsets[0].querySelectorAll('button')[1].click();
    fieldsets[1].querySelectorAll('button')[1].click();
    fixture.detectChanges();
    expect(el.querySelector('[role="status"]')?.textContent).toContain('مطوّر تطبيقات الذكاء الاصطناعي');
    expect(el.querySelector('.tr-card.picked h3')?.textContent).toContain('الذكاء الاصطناعي');
  });
});

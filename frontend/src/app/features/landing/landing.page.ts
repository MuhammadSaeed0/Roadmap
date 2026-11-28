import { TrackRecommenderComponent } from '../tracks/track-recommender.component';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { SHOTS } from '../marketing/marketing.content';

/** Loads the Pre-Roadmap page's code; a second call is served from the module cache. */
export const loadPreRoadmap = () => import('../pre-roadmap/pre-roadmap.page');

/**
 * The public front page for signed-out visitors (people arriving from a shared link). It says what DevPath is,
 * with the app's real numbers and real screenshots, and leads to sign-up. Signed-in learners never see it:
 * "/" matches the dashboard for them (see guestMatch in app.routes.ts).
 *
 * The numbers match the published .NET and Android roadmaps as of 2026-11-28. The marketing post still uses the
 * .NET-only numbers from 2026-11-20.
 */
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TrackRecommenderComponent, RouterLink, IconComponent, TranslatePipe],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export default class LandingPage {
  protected readonly i18n = inject(I18nService);

  protected readonly facts = [
    { n: '28', key: 'landing.facts.phases', icon: 'map' },
    { n: '265', key: 'landing.facts.topics', icon: 'book' },
    { n: '350+', key: 'landing.facts.exercises', icon: 'code' },
    { n: '97', key: 'landing.facts.challenges', icon: 'target' },
    { n: '80', key: 'landing.facts.projects', icon: 'layers' },
    { n: '1,100+', key: 'landing.facts.interviews', icon: 'chat' },
  ];

  protected readonly features = [
    { icon: 'compass', key: 'preRoadmap' },
    { icon: 'map', key: 'roadmap' },
    { icon: 'terminal', key: 'playground' },
    { icon: 'folder', key: 'projects' },
    { icon: 'chat', key: 'interviews' },
    { icon: 'file', key: 'cv' },
  ];

  /** Real screenshots from the marketing kit, in this order. */
  protected readonly shots = ['01-roadmap.jpg', '03-lesson.jpg', '04-playground.jpg', '06-project-library.jpg']
    .map(file => SHOTS.find(s => s.file === file)!)
    .filter(Boolean);
  /** Landing-size copies (1200px WebP, ~45 KB) of the marketing screenshots; the full-size JPEGs stay for the marketing kit. */
  protected readonly url = (file: string) => `marketing/web/${file.replace(/\.jpg$/, '.webp')}`;

  constructor() {
    // The Pre-Roadmap guide is the page visitors open next. Fetch its code while the browser is idle after the
    // landing page has rendered, so the click doesn't wait for it behind the screenshots (it took ~15 s on the host).
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const idle = (cb: () => void) => typeof requestIdleCallback === 'function'
        ? requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 1);
      let done = false;
      destroyRef.onDestroy(() => (done = true));
      idle(() => { if (!done) void loadPreRoadmap().catch(() => undefined); });
    });
  }

  /** Hovering or focusing the link starts the download at once, in case idle time hasn't come yet. */
  protected warmPreRoadmap(): void {
    void loadPreRoadmap().catch(() => undefined);
  }
  protected readonly audience = ['student', 'switcher', 'portfolio'];
}

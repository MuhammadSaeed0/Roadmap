import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { SHOTS, shotUrl } from '../marketing/marketing.content';

/**
 * The public front page for signed-out visitors (people arriving from a shared link). It says what DevPath is,
 * with the app's real numbers and real screenshots, and leads to sign-up. Signed-in learners never see it:
 * "/" matches the dashboard for them (see guestMatch in app.routes.ts).
 *
 * The numbers match the content as of 2026-11-20 (the same facts as the marketing post); update both together.
 */
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export default class LandingPage {
  protected readonly i18n = inject(I18nService);

  protected readonly facts = [
    { n: '14', key: 'landing.facts.phases', icon: 'map' },
    { n: '166', key: 'landing.facts.topics', icon: 'book' },
    { n: '178', key: 'landing.facts.exercises', icon: 'code' },
    { n: '97', key: 'landing.facts.challenges', icon: 'target' },
    { n: '66', key: 'landing.facts.projects', icon: 'layers' },
    { n: '900+', key: 'landing.facts.interviews', icon: 'chat' },
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
  protected readonly url = shotUrl;
  protected readonly audience = ['student', 'switcher', 'portfolio'];
}

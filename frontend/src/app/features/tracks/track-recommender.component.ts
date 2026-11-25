import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Track } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';

/** Which roadmap each answer points to. Answers for roadmaps that aren't published are simply ignored. */
const QUESTIONS = [
  { key: 'build', options: [{ key: 'apps', track: 'dotnet-fullstack' }, { key: 'ai', track: 'ai-app-developer' }] },
  { key: 'enjoy', options: [{ key: 'systems', track: 'dotnet-fullstack' }, { key: 'language', track: 'ai-app-developer' }] },
] as const;

/**
 * The published roadmaps, for visitors and new learners. "cards" lists them (landing page); "quiz" asks two short
 * questions first and recommends one (Before the roadmap). Nothing is shown while there is only one roadmap.
 */
@Component({
  selector: 'app-track-recommender',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe],
  styles: `
    :host { display: block; }
    h2 { margin: 0 0 16px; font-size: 1.3rem; }
    .tr-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .tr-card { display: flex; flex-direction: column; gap: 10px; padding: 18px; height: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .tr-card.picked { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    .tr-card h3 { margin: 0; display: flex; gap: 8px; align-items: center; font-size: 1.05rem; }
    .tr-card h3 .icon { color: var(--accent); }
    .tr-card p { margin: 0; color: var(--text-2); line-height: 1.7; font-size: .95rem; }
    .tr-tech { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .tr-tech li { padding: 2px 10px; border: 1px solid var(--border); border-radius: 999px; font-size: .8rem; }
    .tr-meta { color: var(--muted); font-size: .85rem; }
    .tr-card .btn { margin-top: auto; align-self: flex-start; }
    .tr-quiz { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
    .tr-quiz fieldset { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .tr-quiz legend { font-weight: 600; margin-bottom: 4px; }
    .tr-options { display: flex; flex-wrap: wrap; gap: 8px; }
  `,
  template: `
    @if (tracks().length > 1) {
      <section [attr.aria-labelledby]="'tr-h-' + mode()">
        <h2 [id]="'tr-h-' + mode()">{{ (mode() === 'quiz' ? 'tracks.quizTitle' : 'tracks.landingTitle') | t }}</h2>
        @if (mode() === 'quiz') {
          <div class="tr-quiz">
            @for (q of questions; track q.key; let i = $index) {
              <fieldset>
                <legend>{{ 'tracks.q.' + q.key | t }}</legend>
                <div class="tr-options">
                  @for (o of q.options; track o.key) {
                    <button type="button" class="btn btn-sm" [class.btn-primary]="answers()[i] === o.track" [class.btn-secondary]="answers()[i] !== o.track"
                            [attr.aria-pressed]="answers()[i] === o.track" (click)="answer(i, o.track)">{{ 'tracks.q.' + q.key + '_' + o.key | t }}</button>
                  }
                </div>
              </fieldset>
            }
          </div>
          @if (recommended(); as r) { <p class="small" role="status">{{ 'tracks.recommended' | t: { name: r | loc: 'title' } }}</p> }
        }
        <ul class="tr-grid" role="list">
          @for (t of shown(); track t.slug) {
            <li>
              <article class="tr-card" [class.picked]="recommended()?.slug === t.slug">
                <h3><app-icon [name]="t.icon" [size]="18" /> {{ t | loc: 'title' }}</h3>
                <p>{{ t | loc: 'summary' }}</p>
                <ul class="tr-tech" role="list">@for (tech of t.technologies; track tech) { <li><bdi dir="ltr">{{ tech }}</bdi></li> }</ul>
                <span class="tr-meta">{{ 'tracks.cardMeta' | t: { phases: t.phaseCount, topics: t.topicCount } }} · {{ t.minutes | duration }}</span>
                @if (signedIn()) {
                  <a class="btn btn-secondary btn-sm" routerLink="/tracks">{{ 'tracks.choose' | t }}</a>
                } @else {
                  <a class="btn btn-secondary btn-sm" routerLink="/sign-up">{{ 'tracks.startThis' | t }}</a>
                }
              </article>
            </li>
          }
        </ul>
      </section>
    }
  `,
})
export class TrackRecommenderComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  protected readonly signedIn = computed(() => !!this.auth.account());
  readonly mode = input<'cards' | 'quiz'>('cards');
  protected readonly questions = QUESTIONS;
  protected readonly tracks = signal<Track[]>([]);
  protected readonly answers = signal<(string | null)[]>([null, null]);

  /** The roadmap most answers point to (ties go to the first roadmap, the gentler start). */
  protected readonly recommended = computed<Track | null>(() => {
    const picked = this.answers().filter((a): a is string => !!a);
    if (picked.length < QUESTIONS.length) return null;
    const ranked = [...this.tracks()].sort((a, b) =>
      picked.filter(p => p === b.slug).length - picked.filter(p => p === a.slug).length || a.order - b.order);
    return ranked[0] ?? null;
  });
  protected readonly shown = computed(() => this.tracks());

  constructor() {
    // Never breaks the page around it: no roadmaps (or an error) simply shows nothing.
    Promise.resolve().then(() => this.api.tracks()).then(t => this.tracks.set(t.tracks.filter(x => !x.isDraft))).catch(() => undefined);
  }

  protected answer(index: number, track: string): void {
    this.answers.update(a => a.map((v, i) => (i === index ? track : v)));
  }
}

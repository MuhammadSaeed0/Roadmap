import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { Bilingual, CareerField, PreVideo, SiteLink } from './pre-roadmap.models';
import { PreVideosComponent } from './pre-videos.component';

/** One career field's details on the Pre-Roadmap page: what to learn first, skills, links, resources and videos. */
@Component({
  selector: 'app-pre-field-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./pre-shared.css', './pre-field-detail.component.css'],
  imports: [RouterLink, IconComponent, TranslatePipe, PreVideosComponent],
  template: `
    @let f = field();
    <article id="pre-field-detail" class="card pre-detail" tabindex="-1" role="region" aria-labelledby="pre-detail-title">
      <header class="pre-detail-head">
        <span class="pre-field-icon pre-field-icon-lg" [attr.data-category]="f.category" aria-hidden="true"><app-icon [name]="f.icon" [size]="26" /></span>
        <div class="grow">
          <h3 id="pre-detail-title">{{ text(f.title) }}</h3>
          <p class="pre-detail-summary">{{ text(f.summary) }}</p>
        </div>
        <button type="button" class="icon-btn" (click)="closed.emit()" [attr.aria-label]="'preRoadmap.closeField' | t" [title]="'preRoadmap.closeField' | t">
          <app-icon name="x" />
        </button>
      </header>

      <div class="pre-detail-grid">
        <div class="pre-detail-main">
          <section>
            <h4 class="pre-label"><app-icon name="target" [size]="16" /> {{ 'preRoadmap.startWith' | t }}</h4>
            <ol class="pre-start">
              @for (s of f.startWith; track s.name; let i = $index) {
                <li>
                  <span class="pre-start-num" aria-hidden="true">{{ i + 1 }}</span>
                  <div>
                    <p class="pre-start-name"><bdi dir="ltr">{{ s.name }}</bdi></p>
                    <p class="pre-start-why">{{ text(s.why) }}</p>
                  </div>
                </li>
              }
            </ol>
          </section>
          <section>
            <h4 class="pre-label"><app-icon name="globe" [size]="16" /> {{ 'preRoadmap.examples' | t }}</h4>
            <ul class="pre-dots">@for (e of f.examples; track $index) { <li>{{ text(e) }}</li> }</ul>
          </section>
          <section>
            <h4 class="pre-label"><app-icon name="check-circle" [size]="16" /> {{ 'preRoadmap.skills' | t }}</h4>
            <ul class="pre-dots">@for (s of f.skills; track $index) { <li>{{ text(s) }}</li> }</ul>
          </section>
          <section>
            <h4 class="pre-label"><app-icon name="arrow-right" [size]="16" class="flip-rtl" /> {{ 'preRoadmap.nextSteps' | t }}</h4>
            <ul class="pre-dots">@for (s of f.nextSteps; track $index) { <li>{{ text(s) }}</li> }</ul>
          </section>
        </div>

        <aside class="pre-detail-side">
          <section>
            <h4 class="pre-label"><app-icon name="flame" [size]="16" /> {{ 'preRoadmap.prerequisites' | t }}</h4>
            <span class="level-badge" [attr.data-level]="f.difficulty">{{ 'preRoadmap.levels.' + f.difficulty | t }}</span>
            <p class="small pre-side-text">{{ text(f.prerequisites) }}</p>
          </section>
          <section>
            <h4 class="pre-label"><app-icon name="code" [size]="16" /> {{ 'preRoadmap.technologies' | t }}</h4>
            <ul class="pre-chips" role="list" dir="ltr">@for (tech of f.technologies; track tech) { <li class="chip chip-sm">{{ tech }}</li> }</ul>
          </section>
          <section class="pre-site">
            <h4 class="pre-label"><app-icon name="map" [size]="16" /> {{ 'preRoadmap.onThisSite' | t }}</h4>
            <p class="small pre-side-text">{{ text(f.siteFit) }}</p>
                    @if (links().length > 0) {
              <ul class="pre-links" role="list">
                @for (l of links(); track l.kind + l.label) {
                  <li>
                    <a [routerLink]="l.route" [fragment]="l.fragment" class="pre-link">
                      <span class="pre-link-kind">{{ 'preRoadmap.' + l.kind | t }}</span>
                      <span class="pre-link-name">{{ l.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </section>
          <section>
            <h4 class="pre-label"><app-icon name="link" [size]="16" /> {{ 'preRoadmap.resources' | t }}</h4>
            <ul class="pre-resources" role="list">
              @for (res of f.resources; track res.url) {
                <li>
                  <a [href]="res.url" target="_blank" rel="noopener noreferrer">
                    <span dir="auto">{{ res.name }}</span> <app-icon name="external" [size]="12" />
                    <span class="sr-only">{{ 'preRoadmap.newTab' | t }}</span>
                  </a>
                  <span class="muted small">{{ text(res.note) }}
                    @if (res.language === 'Arabic') { <span class="chip chip-sm video-lang" data-lang="Arabic">{{ 'videos.language.Arabic' | t }}</span> }
                  </span>
                </li>
              }
            </ul>
          </section>
        </aside>
      </div>

      @if (videos().length > 0) {
        <h4 class="pre-label pre-detail-videos"><app-icon name="video" [size]="16" /> {{ 'preRoadmap.videos' | t }}</h4>
        <app-pre-videos [videos]="videos()" />
      }
    </article>
  `,
})
export class PreFieldDetailComponent {
  readonly field = input.required<CareerField>();
  readonly links = input<SiteLink[]>([]);
  readonly videos = input<readonly PreVideo[]>([]);
  readonly closed = output<void>();

  private readonly i18n = inject(I18nService);

  protected text(value: Bilingual): string {
    return this.i18n.pick(value.en, value.ar);
  }
}

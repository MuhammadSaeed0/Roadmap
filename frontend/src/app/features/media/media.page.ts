import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import ResourcesPage from '../resources/resources.page';
import VideoLibraryPage from '../videos/video-library.page';

export type MediaSection = 'videos' | 'resources';
const SECTIONS: MediaSection[] = ['videos', 'resources'];

/**
 * Videos and reading resources in one place, as two tabs (?section=videos|resources). /videos and /resources
 * redirect here and keep their own query parameters, such as the video page's ?tab=saved.
 */
@Component({
  selector: 'app-media-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, VideoLibraryPage, ResourcesPage],
  styles: `
    .media-tabs { margin-bottom: 8px; }
    .media-tabs button { display: inline-flex; align-items: center; gap: 6px; }
  `,
  template: `
    <div class="tabs media-tabs" role="tablist" [attr.aria-label]="'nav.media' | t" data-tour="media-tabs">
      @for (s of sections; track s) {
        <button type="button" role="tab" [id]="'media-tab-' + s" [attr.aria-selected]="section() === s" [attr.aria-controls]="'media-panel-' + s"
                [class.active]="section() === s" (click)="setSection(s)">
          <app-icon [name]="s === 'videos' ? 'video' : 'link'" [size]="15" /> {{ 'media.' + s | t }}
        </button>
      }
    </div>

    @if (section() === 'videos') {
      <div role="tabpanel" id="media-panel-videos" aria-labelledby="media-tab-videos"><app-video-library-page /></div>
    } @else {
      <div role="tabpanel" id="media-panel-resources" aria-labelledby="media-tab-resources"><app-resources-page /></div>
    }
  `,
})
export default class MediaPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly sections = SECTIONS;
  protected readonly section = signal<MediaSection>('videos');

  constructor() {
    // The tour and the old /videos and /resources links switch sections through the URL.
    this.route.queryParamMap.pipe(takeUntilDestroyed())
      .subscribe(q => this.section.set(SECTIONS.find(s => s === q.get('section')) ?? 'videos'));
  }

  protected setSection(section: MediaSection): void {
    // Each section has its own filters, so they are not carried over.
    void this.router.navigate([], { relativeTo: this.route, queryParams: { section }, replaceUrl: true });
  }
}

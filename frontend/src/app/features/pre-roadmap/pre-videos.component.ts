import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '../../core/i18n/pipes';
import { TopicVideo } from '../../core/models';
import { VideoLanguageService } from '../../core/video-language';
import { embedUrl, watchUrl } from '../../core/youtube';
import { IconComponent } from '../../shared/icon.component';
import { VideoCardComponent } from '../../shared/video-card.component';
import { PreVideo } from './pre-roadmap.models';

/**
 * A row of curated videos on the Pre-Roadmap page. Plays a video in the page (privacy-enhanced embed) and follows
 * the page's Arabic/English choice (the VideoLanguageService the page provides).
 */
@Component({
  selector: 'app-pre-videos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, VideoCardComponent],
  template: `
    @if (playing(); as p) {
      <div class="video-player">
        <div class="video-frame">
          <iframe [src]="playerUrl()" [title]="'videos.playerTitle' | t: { title: p.title }" loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <div class="video-player-bar">
          <div class="grow">
            <p class="video-player-title" [attr.dir]="p.language === 'Arabic' ? 'rtl' : 'auto'">{{ p.title }}</p>
            <p class="muted small">{{ p.channelTitle }}</p>
          </div>
          <a [href]="watch(p.videoId)" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            <app-icon name="external" [size]="14" /> {{ 'videos.openOnYoutube' | t }}
          </a>
          <button type="button" class="icon-btn" (click)="playing.set(null)" [attr.aria-label]="'videos.close' | t"><app-icon name="x" /></button>
        </div>
      </div>
    }
    <ul class="video-grid pre-video-grid" role="list">
      @for (video of shown(); track video.videoId) {
        <li>
          <app-video-card [video]="video" [actions]="false" [removable]="false"
                          [playing]="playing()?.videoId === video.videoId" (play)="playing.set(video)" />
        </li>
      } @empty {
        <li class="muted small">{{ 'videos.noneInLanguage' | t }}</li>
      }
    </ul>
  `,
})
export class PreVideosComponent {
  readonly videos = input.required<readonly PreVideo[]>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly languages = inject(VideoLanguageService);
  protected readonly watch = watchUrl;
  protected readonly playing = signal<TopicVideo | null>(null);

  protected readonly shown = computed(() => this.languages.apply(this.videos().map(toTopicVideo)));

  /** Only built from a curated, validated video id, so bypassing Angular's URL check is safe here. */
  protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.playing();
    return video ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl(video.videoId)) : null;
  });
}

function toTopicVideo(v: PreVideo): TopicVideo {
  return {
    videoId: v.videoId, title: v.title, channelTitle: v.channel, publishedAt: null, durationSeconds: v.durationSeconds,
    source: 'suggested', addedId: null, isWatched: false, isBookmarked: false, language: v.language,
  };
}

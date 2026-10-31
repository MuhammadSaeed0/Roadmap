import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../core/i18n/pipes';
import { TopicVideo } from '../core/models';
import { formatVideoDuration, thumbnailUrl, watchUrl } from '../core/youtube';
import { IconComponent } from './icon.component';

/** One YouTube video: thumbnail (plays it in the page), title, channel, language, duration and watched/saved flags. */
@Component({
  selector: 'app-video-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  host: { class: 'video-card', '[class.is-playing]': 'playing()' },
  template: `
    <button type="button" class="video-thumb" (click)="play.emit()" [attr.aria-label]="'videos.play' | t: { title: video().title }">
      <img [src]="thumb()" alt="" loading="lazy" width="320" height="180" />
      <span class="video-play" aria-hidden="true"><app-icon name="play" [size]="20" /></span>
      @if (duration(); as d) { <span class="video-duration">{{ d }}</span> }
      @if (video().isWatched) { <span class="video-watched"><app-icon name="check" [size]="12" /> {{ 'videos.watched' | t }}</span> }
    </button>
    <div class="video-body">
      <p class="video-title" [title]="video().title" [attr.dir]="video().language === 'Arabic' ? 'rtl' : 'auto'">{{ video().title }}</p>
      <p class="muted small video-channel">
        {{ video().channelTitle }}
        @if (video().language; as lang) { <span class="chip chip-sm video-lang" [attr.data-lang]="lang">{{ ('videos.language.' + lang) | t }}</span> }
        @if (video().source === 'added') { <span class="chip chip-sm">{{ 'videos.addedByYou' | t }}</span> }
        @if (video().source === 'topic') { <span class="chip chip-sm chip-ghost">{{ 'videos.fromTopic' | t }}</span> }
      </p>
      @if (video().description) { <p class="small video-desc">{{ video().description }}</p> }
      <div class="video-actions">
        <button type="button" class="icon-btn" [class.is-on]="video().isWatched" [attr.aria-pressed]="video().isWatched"
                [attr.aria-label]="(video().isWatched ? 'videos.markUnwatched' : 'videos.markWatched') | t"
                [title]="(video().isWatched ? 'videos.markUnwatched' : 'videos.markWatched') | t"
                [disabled]="busy()" (click)="toggle.emit('isWatched')">
          <app-icon name="check-circle" [size]="17" />
        </button>
        <button type="button" class="icon-btn" [class.is-on]="video().isBookmarked" [attr.aria-pressed]="video().isBookmarked"
                [attr.aria-label]="(video().isBookmarked ? 'videos.unsave' : 'videos.save') | t"
                [title]="(video().isBookmarked ? 'videos.unsave' : 'videos.save') | t"
                [disabled]="busy()" (click)="toggle.emit('isBookmarked')">
          <app-icon name="bookmark" [size]="17" />
        </button>
        <a class="icon-btn" [href]="watch()" target="_blank" rel="noopener noreferrer"
           [attr.aria-label]="('videos.openOnYoutube' | t) + ': ' + video().title" [title]="'videos.openOnYoutube' | t">
          <app-icon name="external" [size]="16" />
        </a>
        @if (removable() && video().addedId !== null) {
          <button type="button" class="icon-btn" [attr.aria-label]="'videos.remove' | t" [title]="'videos.remove' | t"
                  [disabled]="busy()" (click)="remove.emit()">
            <app-icon name="trash" [size]="16" />
          </button>
        }
      </div>
    </div>
  `,
})
export class VideoCardComponent {
  readonly video = input.required<TopicVideo>();
  readonly playing = input(false);
  readonly busy = input(false);
  readonly removable = input(true);
  readonly play = output<void>();
  readonly toggle = output<'isWatched' | 'isBookmarked'>();
  readonly remove = output<void>();

  protected thumb() { return thumbnailUrl(this.video().videoId); }
  protected watch() { return watchUrl(this.video().videoId); }
  protected duration() { return formatVideoDuration(this.video().durationSeconds); }
}

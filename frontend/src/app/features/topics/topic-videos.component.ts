import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { TopicVideo } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { embedUrl, formatVideoDuration, parseYouTubeVideoId, searchUrl, thumbnailUrl, watchUrl } from '../../core/youtube';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * Videos for one topic (shared YouTube suggestions plus videos the user added by link), or for one
 * project task when taskId is set (videos picked for the task, topped up from its linked topics).
 * A video plays inside the page only after the user picks it (no YouTube requests
 * before that), and every card also links to YouTube in case embedding fails.
 */
@Component({
  selector: 'app-topic-videos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe, SkeletonComponent, ErrorStateComponent],
  template: `
    <section class="card content-section" [id]="taskId() ? null : 'videos'" [attr.aria-labelledby]="headingId()">
      <div class="card-head">
        <h2 [id]="headingId()" class="section-title"><app-icon name="video" /> {{ (taskId() ? 'videos.taskTitle' : 'videos.title') | t }}</h2>
        <a class="btn btn-ghost btn-sm" [href]="youtubeSearch()" target="_blank" rel="noopener noreferrer">
          <app-icon name="search" [size]="14" /> {{ 'videos.searchYoutube' | t }}
        </a>
      </div>

      @if (data.initialLoading()) {
        <div class="video-grid" aria-hidden="true">
          @for (i of [1, 2, 3]; track i) { <div class="video-card"><div class="skeleton video-skeleton"></div><app-skeleton [rows]="2" [height]="14" /></div> }
        </div>
      } @else if (data.error()) {
        <app-error-state [error]="data.error()" (retry)="data.reload()" />
      } @else if (data.value(); as v) {
        @switch (v.status) {
          @case ('not_configured') { <p class="callout callout-info"><app-icon name="info" /> {{ 'videos.notConfigured' | t }}</p> }
          @case ('quota_exceeded') { <p class="callout callout-warn"><app-icon name="alert" /> {{ 'videos.quota' | t }}</p> }
          @case ('unavailable') {
            <div class="callout callout-warn" role="status">
              <app-icon name="alert" />
              <span>{{ 'videos.unavailable' | t }} <button type="button" class="link-btn" (click)="data.reload()">{{ 'common.retry' | t }}</button></span>
            </div>
          }
        }

        @if (playing(); as p) {
          <div class="video-player">
            <div class="video-frame">
              <iframe [src]="playerUrl()" [title]="'videos.playerTitle' | t: { title: p.title }" loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
            <div class="video-player-bar">
              <div class="grow">
                <p class="video-player-title">{{ p.title }}</p>
                <p class="muted small">{{ p.channelTitle }}</p>
              </div>
              <a [href]="watch(p.videoId)" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                <app-icon name="external" [size]="14" /> {{ 'videos.openOnYoutube' | t }}
              </a>
              <button type="button" class="icon-btn" (click)="playing.set(null)" [attr.aria-label]="'videos.close' | t"><app-icon name="x" /></button>
            </div>
            <p class="muted tiny">{{ 'videos.embedHelp' | t }}</p>
          </div>
        }

        @if (v.videos.length === 0) {
          <p class="muted">{{ (v.status === 'ok' ? 'videos.empty' : 'videos.emptyAdd') | t }}</p>
        } @else {
          <ul class="video-grid" role="list">
            @for (video of v.videos; track video.videoId) {
              <li class="video-card" [class.is-playing]="playing()?.videoId === video.videoId">
                <button type="button" class="video-thumb" (click)="play(video)" [attr.aria-label]="'videos.play' | t: { title: video.title }">
                  <img [src]="thumb(video.videoId)" alt="" loading="lazy" width="320" height="180" />
                  <span class="video-play" aria-hidden="true"><app-icon name="play" [size]="20" /></span>
                  @if (duration(video); as d) { <span class="video-duration">{{ d }}</span> }
                  @if (video.isWatched) { <span class="video-watched"><app-icon name="check" [size]="12" /> {{ 'videos.watched' | t }}</span> }
                </button>
                <div class="video-body">
                  <p class="video-title" [title]="video.title">{{ video.title }}</p>
                  <p class="muted small video-channel">
                    {{ video.channelTitle }}@if (video.source === 'added') { <span class="chip chip-sm">{{ 'videos.addedByYou' | t }}</span> }
                    @if (video.source === 'topic') { <span class="chip chip-sm chip-ghost">{{ 'videos.fromTopic' | t }}</span> }
                  </p>
                  <div class="video-actions">
                    <button type="button" class="icon-btn" [class.is-on]="video.isWatched" [attr.aria-pressed]="video.isWatched"
                            [attr.aria-label]="(video.isWatched ? 'videos.markUnwatched' : 'videos.markWatched') | t"
                            [title]="(video.isWatched ? 'videos.markUnwatched' : 'videos.markWatched') | t"
                            [disabled]="busy() === video.videoId" (click)="toggle(video, 'isWatched')">
                      <app-icon name="check-circle" [size]="17" />
                    </button>
                    <button type="button" class="icon-btn" [class.is-on]="video.isBookmarked" [attr.aria-pressed]="video.isBookmarked"
                            [attr.aria-label]="(video.isBookmarked ? 'videos.unsave' : 'videos.save') | t"
                            [title]="(video.isBookmarked ? 'videos.unsave' : 'videos.save') | t"
                            [disabled]="busy() === video.videoId" (click)="toggle(video, 'isBookmarked')">
                      <app-icon name="bookmark" [size]="17" />
                    </button>
                    <a class="icon-btn" [href]="watch(video.videoId)" target="_blank" rel="noopener noreferrer"
                       [attr.aria-label]="('videos.openOnYoutube' | t) + ': ' + video.title" [title]="'videos.openOnYoutube' | t">
                      <app-icon name="external" [size]="16" />
                    </a>
                    @if (video.addedId !== null) {
                      <button type="button" class="icon-btn" [attr.aria-label]="'videos.remove' | t" [title]="'videos.remove' | t"
                              [disabled]="busy() === video.videoId" (click)="remove(video)">
                        <app-icon name="trash" [size]="16" />
                      </button>
                    }
                  </div>
                </div>
              </li>
            }
          </ul>
        }

        @if (taskId()) {
          <p class="muted small">{{ 'videos.taskAddHint' | t }}</p>
        } @else {
        <form class="video-add" (submit)="$event.preventDefault(); add()" novalidate>
          <label for="video-url" class="label">{{ 'videos.addLabel' | t }}</label>
          <div class="video-add-row">
            <input id="video-url" type="url" class="input" inputmode="url" [formControl]="url" [placeholder]="'videos.addPlaceholder' | t"
                   autocomplete="off" spellcheck="false" dir="ltr" [attr.aria-invalid]="!!addError()" aria-describedby="video-url-err" />
            <button type="submit" class="btn btn-secondary" [disabled]="adding()">
              @if (adding()) { <app-icon name="refresh" class="spin" [size]="15" /> {{ 'videos.adding' | t }} }
              @else { <app-icon name="plus" [size]="15" /> {{ 'videos.add' | t }} }
            </button>
          </div>
          @if (addError(); as err) { <small id="video-url-err" class="field-error" role="alert">{{ err }}</small> }
        </form>
        }
      }
    </section>
  `,
})
export class TopicVideosComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly topicId = input<number | null>(null);
  readonly taskId = input<number | null>(null);
  readonly topicTitle = input.required<string>();

  protected readonly data = createLoader(() => {
    const taskId = this.taskId();
    return taskId ? this.api.taskVideos(taskId) : this.api.topicVideos(this.topicId()!);
  }, { immediate: false });
  protected readonly headingId = computed(() => (this.taskId() ? `videos-h-task-${this.taskId()}` : 'videos-h'));
  protected readonly playing = signal<TopicVideo | null>(null);
  protected readonly busy = signal<string | null>(null);
  protected readonly adding = signal(false);
  protected readonly addError = signal<string | null>(null);
  protected readonly url = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });

  /** Only built from a validated video id, so bypassing Angular's URL check is safe here. */
  protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.playing();
    return video ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl(video.videoId)) : null;
  });

  /** The query the API searches YouTube with; before it loads, the topic title is a fine search. */
  protected readonly youtubeSearch = computed(() => searchUrl(this.data.value()?.searchQuery || `${this.topicTitle()} tutorial`));

  protected readonly watch = watchUrl;
  protected readonly thumb = thumbnailUrl;
  protected readonly duration = (v: TopicVideo) => formatVideoDuration(v.durationSeconds);

  constructor() {
    effect(() => {
      this.topicId();
      this.taskId();
      untracked(() => {
        this.playing.set(null);
        this.addError.set(null);
        this.url.reset();
        void this.data.reload();
      });
    });
  }

  protected play(video: TopicVideo): void {
    this.playing.set(video);
  }

  protected async toggle(video: TopicVideo, flag: 'isWatched' | 'isBookmarked'): Promise<void> {
    const next = { isWatched: video.isWatched, isBookmarked: video.isBookmarked, [flag]: !video[flag] };
    this.busy.set(video.videoId);
    try {
      // Task videos store their flags against the task's first linked topic.
      const topicId = this.taskId() ? this.data.value()?.progressTopicId : this.topicId();
      if (!topicId) return;
      await this.api.setVideoProgress(topicId, video.videoId, next);
      this.data.update((v) => ({ ...v, videos: v.videos.map((x) => (x.videoId === video.videoId ? { ...x, ...next } : x)) }));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }

  protected async add(): Promise<void> {
    this.addError.set(null);
    const value = this.url.value.trim();
    const videoId = parseYouTubeVideoId(value);
    if (!value || !videoId) {
      this.addError.set(this.i18n.t(value ? 'errors.codes.invalid_url' : 'validation.required'));
      return;
    }
    if (this.data.value()?.videos.some((v) => v.videoId === videoId)) {
      this.addError.set(this.i18n.t('errors.codes.video_duplicate'));
      return;
    }
    this.adding.set(true);
    try {
      const video = await this.api.addTopicVideo(this.topicId()!, value);
      this.data.update((v) => ({ ...v, videos: [...v.videos, video] }));
      this.url.reset();
      this.toast.success(this.i18n.t('videos.added'));
    } catch (e) {
      this.addError.set(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.adding.set(false);
    }
  }

  protected async remove(video: TopicVideo): Promise<void> {
    if (video.addedId === null) return;
    if (!(await this.confirm.ask({ message: this.i18n.t('videos.removeConfirm'), danger: true, confirmText: this.i18n.t('common.delete') }))) return;
    this.busy.set(video.videoId);
    try {
      await this.api.removeTopicVideo(video.addedId);
      if (this.playing()?.videoId === video.videoId) this.playing.set(null);
      this.data.update((v) => ({ ...v, videos: v.videos.filter((x) => x.videoId !== video.videoId) }));
      this.toast.info(this.i18n.t('videos.removed'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

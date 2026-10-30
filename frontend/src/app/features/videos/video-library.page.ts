import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import '../../core/i18n/workspace-strings';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { SKILLS, SkillArea, TopicVideo, VideoLibrary } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { VideoLanguageFilter, VideoLanguageService } from '../../core/video-language';
import { embedUrl, watchUrl } from '../../core/youtube';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { VideoCardComponent } from '../../shared/video-card.component';

type Library = VideoLibrary;
type LibraryTopic = Library['phases'][number]['topics'][number];

/** Every hand-picked video of the roadmap, by phase and topic, in Arabic and English. */
@Component({
  selector: 'app-video-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe, LocalizePipe, PageHeaderComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent, VideoCardComponent],
  template: `
    <app-page-header [title]="'videoLibrary.title' | t" [subtitle]="'videoLibrary.subtitle' | t" />

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as lib) {
      <div class="grid grid-3 stat-cards" data-tour="videos-stats">
        <div class="card stat-card"><span class="stat-label">{{ 'videos.language.Arabic' | t }}</span><span class="stat-value">{{ lib.arabicCount }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'videos.language.English' | t }}</span><span class="stat-value">{{ lib.englishCount }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'videoLibrary.watched' | t }}</span><span class="stat-value">{{ lib.watchedCount }}</span></div>
      </div>

      <div class="toolbar" data-tour="videos-filters">
        <div class="segmented" role="radiogroup" [attr.aria-label]="'videos.languageFilter' | t">
          @for (option of languageOptions; track option) {
            <button type="button" role="radio" [class.active]="languages.filter() === option" [attr.aria-checked]="languages.filter() === option"
                    (click)="languages.set(option)">{{ ('videos.language.' + option) | t }}</button>
          }
        </div>
        <label class="sr-only" for="vl-search">{{ 'videoLibrary.search' | t }}</label>
        <input id="vl-search" class="input input-sm" type="search" [ngModel]="search()" (ngModelChange)="search.set($event)" [placeholder]="'videoLibrary.search' | t">
        <label class="sr-only" for="vl-skill">{{ 'library.allSkills' | t }}</label>
        <select id="vl-skill" class="input input-sm" [ngModel]="skill()" (ngModelChange)="skill.set($event)">
          <option value="">{{ 'library.allSkills' | t }}</option>
          @for (s of skills; track s) { <option [value]="s">{{ 'skills.' + s | t }}</option> }
        </select>
        <label class="check-label small"><input type="checkbox" [ngModel]="unwatchedOnly()" (ngModelChange)="unwatchedOnly.set($event)"> {{ 'videoLibrary.unwatchedOnly' | t }}</label>
      </div>

      @if (playing(); as p) {
        <div class="video-player card">
          <div class="video-frame">
            <iframe [src]="playerUrl()" [title]="'videos.playerTitle' | t: { title: p.title }" loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </div>
          <div class="video-player-bar">
            <div class="grow"><p class="video-player-title">{{ p.title }}</p><p class="muted small">{{ p.channelTitle }}</p></div>
            <a [href]="watch(p.videoId)" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><app-icon name="external" [size]="14" /> {{ 'videos.openOnYoutube' | t }}</a>
            <button type="button" class="icon-btn" (click)="playing.set(null)" [attr.aria-label]="'videos.close' | t"><app-icon name="x" /></button>
          </div>
        </div>
      }

      @if (phases().length === 0) {
        <app-empty-state icon="video" [title]="'videoLibrary.empty' | t" />
      }
      @for (phase of phases(); track phase.id) {
        <details class="card video-phase" [open]="filtering() || phase.order === firstPhase()" data-tour="videos-phase">
          <summary>
            <span class="phase-num">{{ 'roadmap.phase' | t: { n: phase.order } }}</span>
            <strong>{{ phase | loc: 'title' }}</strong>
            <span class="muted small">{{ 'videoLibrary.count' | t: { n: phase.count } }}</span>
          </summary>
          @for (topic of phase.topics; track topic.id) {
            <section class="video-topic" [attr.aria-labelledby]="'vt-' + topic.id">
              <h3 [id]="'vt-' + topic.id"><a [routerLink]="['/topics', topic.id]" [fragment]="'videos'">{{ topic | loc: 'title' }}</a>
                <span class="chip chip-sm chip-ghost">{{ 'skills.' + topic.skill | t }}</span></h3>
              <ul class="video-grid" role="list">
                @for (video of topic.videos; track video.videoId) {
                  <li>
                    <app-video-card [video]="video" [playing]="playing()?.videoId === video.videoId" [busy]="busy() === video.videoId" [removable]="false"
                                    (play)="playing.set(video)" (toggle)="toggle(topic, video, $event)" />
                  </li>
                }
              </ul>
            </section>
          }
        </details>
      }
    }
  `,
})
export default class VideoLibraryPage {
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  protected readonly languages = inject(VideoLanguageService);

  protected readonly languageOptions: VideoLanguageFilter[] = ['all', 'Arabic', 'English'];
  protected readonly skills = SKILLS;
  protected readonly data = createLoader(() => this.api.videoLibrary());
  protected readonly search = signal('');
  protected readonly skill = signal<SkillArea | ''>('');
  protected readonly unwatchedOnly = signal(false);
  protected readonly playing = signal<TopicVideo | null>(null);
  protected readonly busy = signal<string | null>(null);
  protected readonly watch = watchUrl;
  /** Only built from a video id the API validated, so trusting it as a resource URL is safe. */
  protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.playing();
    return video ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl(video.videoId)) : null;
  });

  protected readonly phases = computed(() => {
    const lib = this.data.value();
    if (!lib) return [];
    const q = this.search().trim().toLowerCase();
    return lib.phases.map(phase => {
      const topics = phase.topics
        .filter(t => !this.skill() || t.skill === this.skill())
        .map(t => {
          const titleMatches = !q || t.titleEn.toLowerCase().includes(q) || t.titleAr.includes(q);
          const videos = this.languages.apply(t.videos)
            .filter(v => !this.unwatchedOnly() || !v.isWatched)
            .filter(v => titleMatches || v.title.toLowerCase().includes(q) || v.channelTitle.toLowerCase().includes(q));
          return { ...t, videos };
        })
        .filter(t => t.videos.length > 0);
      return { ...phase, topics, count: topics.reduce((n, t) => n + t.videos.length, 0) };
    }).filter(p => p.topics.length > 0);
  });

  /** While browsing only the first phase is open; while searching or filtering, every matching phase is. */
  protected readonly filtering = computed(() => !!(this.search().trim() || this.skill() || this.unwatchedOnly()));
  protected readonly firstPhase = computed(() => this.phases()[0]?.order ?? -1);

  protected async toggle(topic: LibraryTopic, video: TopicVideo, flag: 'isWatched' | 'isBookmarked'): Promise<void> {
    const next = { isWatched: video.isWatched, isBookmarked: video.isBookmarked, [flag]: !video[flag] };
    this.busy.set(video.videoId);
    try {
      await this.api.setVideoProgress(topic.id, video.videoId, next);
      this.data.update(lib => ({
        ...lib,
        watchedCount: lib.watchedCount + (flag === 'isWatched' ? (next.isWatched ? 1 : -1) : 0),
        phases: lib.phases.map(p => ({ ...p, topics: p.topics.map(t => ({ ...t, videos: t.videos.map(v => (v.videoId === video.videoId ? { ...v, ...next } : v)) })) })),
      }));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

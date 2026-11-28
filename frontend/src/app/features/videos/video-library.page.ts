import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TrackStore } from '../../core/track.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import '../../core/i18n/workspace-strings';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { SKILLS, SavedVideo, SkillArea, TopicVideo, Track, VideoLibrary } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { VideoLanguageFilter, VideoLanguageService, provideVideoLanguage } from '../../core/video-language';
import { embedUrl, watchUrl } from '../../core/youtube';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { VideoCardComponent } from '../../shared/video-card.component';

type Tab = 'all' | 'saved';
type Flags = { isWatched: boolean; isBookmarked: boolean };
type LibraryPhase = VideoLibrary['phases'][number];
/** A phase with its number inside its own roadmap (every roadmap starts at Phase 1). */
export type NumberedPhase = LibraryPhase & { number: number };
/** The phases shown under one roadmap heading; track is null for phases no roadmap holds. */
export interface RoadmapSection { track: Track | null; phases: NumberedPhase[]; }

/**
 * Groups the library's phases by roadmap. One roadmap: only its phases, numbered by their position in it. Every
 * roadmap (slug ''): a section per roadmap in roadmap order, each numbered from 1; a phase two roadmaps share is shown
 * once, under the first roadmap that holds it (keeping its number there).
 */
export function roadmapSections(phases: LibraryPhase[], tracks: Track[], slug: string): RoadmapSection[] {
  const byId = new Map(phases.map(p => [p.id, p]));
  const numbered = (t: Track) => t.phaseIds
    .map((id, i) => ({ phase: byId.get(id), number: i + 1 }))
    .filter((x): x is { phase: LibraryPhase; number: number } => !!x.phase)
    .map(x => ({ ...x.phase, number: x.number }));
  if (slug) {
    const track = tracks.find(t => t.slug === slug);
    return track ? [{ track, phases: numbered(track) }] : [];
  }
  const shown = new Set<number>();
  const sections: RoadmapSection[] = [];
  for (const track of tracks) {
    const list = numbered(track).filter(p => !shown.has(p.id));
    list.forEach(p => shown.add(p.id));
    if (list.length) sections.push({ track, phases: list });
  }
  const rest = phases.filter(p => !shown.has(p.id)).map(p => ({ ...p, number: p.order }));
  if (rest.length) sections.push({ track: null, phases: rest });
  return sections;
}

/** Every hand-picked video of the roadmap, by phase and topic, in Arabic and English, plus the videos you saved. */
@Component({
  selector: 'app-video-library-page',
  providers: [provideVideoLanguage('library')],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe, LocalizePipe, PageHeaderComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent, VideoCardComponent],
  template: `
    <app-page-header [title]="'videoLibrary.title' | t" [subtitle]="'videoLibrary.subtitle' | t">
      @if (tab() === 'all' && data.value()) {
        <div class="row-gap">
          <button type="button" class="btn btn-secondary btn-sm" (click)="setAll(true)">{{ 'roadmap.expandAll' | t }}</button>
          <button type="button" class="btn btn-ghost btn-sm" (click)="setAll(false)">{{ 'roadmap.collapseAll' | t }}</button>
        </div>
      }
    </app-page-header>
    @if (tracks.tracks().length > 1) {
      <div class="segmented roadmap-filter" role="radiogroup" [attr.aria-label]="'tracks.scopeLabel' | t">
        <button type="button" role="radio" [class.active]="roadmap() === ''" [attr.aria-checked]="roadmap() === ''" (click)="setRoadmap('')">
          <app-icon name="layers" [size]="15" /> {{ 'tracks.scopeAll' | t }}</button>
        @for (t of tracks.tracks(); track t.slug) {
          <button type="button" role="radio" [class.active]="roadmap() === t.slug" [attr.aria-checked]="roadmap() === t.slug" (click)="setRoadmap(t.slug)">
            <app-icon [name]="t.icon" [size]="15" /> {{ t | loc: 'title' }}</button>
        }
      </div>
    }

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as lib) {
      <div class="grid grid-3 stat-cards" data-tour="videos-stats">
        <div class="card stat-card"><span class="stat-label">{{ 'videos.language.Arabic' | t }}</span><span class="stat-value">{{ counts().arabic }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'videos.language.English' | t }}</span><span class="stat-value">{{ counts().english }}</span></div>
        <div class="card stat-card"><span class="stat-label">{{ 'videoLibrary.watched' | t }}</span><span class="stat-value">{{ counts().watched }}</span></div>
      </div>

      <div class="tabs video-tabs" role="tablist" [attr.aria-label]="'videoLibrary.tabs' | t">
        <button type="button" role="tab" id="vtab-all" aria-controls="vpanel" [attr.aria-selected]="tab() === 'all'" [class.active]="tab() === 'all'"
                (click)="setTab('all')">{{ 'videoLibrary.tabAll' | t }}</button>
        <button type="button" role="tab" id="vtab-saved" aria-controls="vpanel" [attr.aria-selected]="tab() === 'saved'" [class.active]="tab() === 'saved'"
                (click)="setTab('saved')">
          <app-icon name="bookmark" [size]="15" /> {{ 'videoLibrary.tabSaved' | t }}
          @if (saved.value(); as list) { <span class="tab-count">{{ list.length }}</span> }
        </button>
      </div>

      <div id="vpanel" role="tabpanel" [attr.aria-labelledby]="tab() === 'all' ? 'vtab-all' : 'vtab-saved'">
      <div class="toolbar" data-tour="videos-filters">
        <div class="segmented" role="radiogroup" [attr.aria-label]="'videos.languageFilter' | t">
          @for (option of languageOptions; track option) {
            <button type="button" role="radio" [class.active]="languages.filter() === option" [attr.aria-checked]="languages.filter() === option"
                    (click)="languages.set(option)">{{ ('videos.language.' + option) | t }}</button>
          }
        </div>
        <label class="sr-only" for="vl-search">{{ 'videoLibrary.search' | t }}</label>
        <input id="vl-search" class="input input-sm" type="search" [ngModel]="search()" (ngModelChange)="search.set($event)" [placeholder]="'videoLibrary.search' | t">
        <label class="check-label small"><input type="checkbox" [ngModel]="unwatchedOnly()" (ngModelChange)="unwatchedOnly.set($event)"> {{ 'videoLibrary.unwatchedOnly' | t }}</label>
      </div>

      @if (skills().length > 1) {
        <div class="chip-rail chip-wrap" role="group" [attr.aria-label]="'library.allSkills' | t">
          <button type="button" class="chip chip-btn" [class.active]="skill() === ''" [attr.aria-pressed]="skill() === ''" (click)="skill.set('')">{{ 'library.allSkills' | t }}</button>
          @for (s of skills(); track s) {
            <button type="button" class="chip chip-btn" [class.active]="skill() === s" [attr.aria-pressed]="skill() === s" (click)="skill.set(s)">{{ 'skills.' + s | t }}</button>
          }
        </div>
      }

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

      @if (tab() === 'all') {
        @if (phases().length === 0) {
          <app-empty-state icon="video" [title]="'videoLibrary.empty' | t" />
        }
        @for (section of sections(); track section.track?.slug ?? '') {
        @if (roadmap() === '' && section.track) {
          <h2 class="roadmap-heading"><app-icon [name]="section.track.icon" [size]="18" /> {{ section.track | loc: 'title' }}</h2>
        }
        <ol class="timeline" role="list">
          @for (phase of section.phases; track phase.id) {
            <li class="phase card" data-tour="videos-phase">
              <button type="button" class="phase-head" (click)="toggle(phase.id)" [attr.aria-expanded]="isOpen(phase.id)"
                      [attr.aria-controls]="'vphase-' + phase.id">
                <span class="phase-num" aria-hidden="true">{{ phase.number }}</span>
                <span class="phase-info">
                  <span class="phase-eyebrow">{{ 'roadmap.phase' | t: { n: phase.number } }}</span>
                  <span class="phase-title">{{ phase | loc: 'title' }}</span>
                </span>
                <span class="phase-stats"><span class="small">{{ 'videoLibrary.count' | t: { n: phase.count } }}</span></span>
                <app-icon name="chevron-down" class="chev" [class.open]="isOpen(phase.id)" />
              </button>
              @if (isOpen(phase.id)) {
                <div class="phase-body" [id]="'vphase-' + phase.id">
                  @for (topic of phase.topics; track topic.id) {
                    <section class="video-topic" [attr.aria-labelledby]="'vt-' + topic.id">
                      <h3 [id]="'vt-' + topic.id"><a [routerLink]="['/topics', topic.id]" [fragment]="'videos'">{{ topic | loc: 'title' }}</a>
                        <span class="chip chip-sm chip-ghost">{{ 'skills.' + topic.skill | t }}</span></h3>
                      <ul class="video-grid" role="list">
                        @for (video of topic.videos; track video.videoId) {
                          <li>
                            <app-video-card [video]="video" [playing]="playing()?.videoId === video.videoId" [busy]="busy() === video.videoId" [removable]="false"
                                            (play)="playing.set(video)" (toggle)="setFlag(topic.id, video, $event)" />
                          </li>
                        }
                      </ul>
                    </section>
                  }
                </div>
              }
            </li>
          }
        </ol>
        }
      } @else {
        @if (saved.initialLoading()) {
          <div class="card"><app-skeleton [rows]="3" /></div>
        } @else if (saved.error()) {
          <app-error-state [error]="saved.error()" (retry)="saved.reload()" />
        } @else if ((saved.value() ?? []).length === 0) {
          <app-empty-state icon="bookmark" [title]="'videoLibrary.savedEmpty' | t" [message]="'videoLibrary.savedEmptyHint' | t" />
        } @else if (savedShown().length === 0) {
          <app-empty-state icon="bookmark" [title]="'videoLibrary.savedNoMatch' | t" />
        } @else {
          <ul class="video-grid saved-grid" role="list">
            @for (item of savedShown(); track item.video.videoId) {
              <li class="saved-item">
                <app-video-card [video]="item.video" [playing]="playing()?.videoId === item.video.videoId" [busy]="busy() === item.video.videoId" [removable]="false"
                                (play)="playing.set(item.video)" (toggle)="setFlag(item.topicId, item.video, $event)" />
                <a class="saved-from small" [routerLink]="['/topics', item.topicId]" [fragment]="'videos'">
                  {{ 'videoLibrary.savedFrom' | t: { topic: (item | loc: 'topicTitle') } }}
                </a>
              </li>
            }
          </ul>
        }
      }
      </div>
    }
  `,
  styles: `
    .roadmap-filter { flex-wrap: wrap; margin: 0 0 16px; }
    /* Skills wrap onto more rows instead of scrolling past the page edge. */
    .chip-wrap { flex-wrap: wrap; overflow-x: visible; }
    .chip-wrap .chip { flex: none; max-width: 100%; }
    .roadmap-heading { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; margin: 20px 0 10px; }
  `,
})
export default class VideoLibraryPage {
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly languages = inject(VideoLanguageService);

  protected readonly languageOptions: VideoLanguageFilter[] = ['all', 'Arabic', 'English'];
  protected readonly tracks = inject(TrackStore);
  /**
   * Every roadmap's videos, loaded once; the roadmap filter works in the browser. The roadmap list loads alongside,
   * so the page never shows every roadmap first and then jumps to the learner's own.
   */
  protected readonly data = createLoader(() => Promise.all([this.api.videoLibrary(null, true), this.tracks.load()]).then(([lib]) => lib));
  /** The roadmap picked by hand: '' for every roadmap; null until then, which means the learner's own roadmap. */
  private readonly picked = signal<string | null>(null);
  protected readonly roadmap = computed(() => {
    const picked = this.picked();
    if (picked !== null) return picked;
    return this.tracks.tracks().length > 1 ? this.tracks.activeSlug() ?? '' : '';
  });
  /** The roadmap's phases, numbered inside each roadmap. */
  private readonly scoped = computed(() => roadmapSections(this.data.value()?.phases ?? [], this.tracks.tracks(), this.roadmap()));
  /** Topics of the chosen roadmap, for the saved list. */
  private readonly scopedTopics = computed(() => new Set(this.scoped().flatMap(s => s.phases.flatMap(p => p.topics.map(t => t.id)))));
  /** Only the skills that have videos in the chosen roadmap, in the usual skill order. */
  protected readonly skills = computed(() => {
    const present = new Set(this.scoped().flatMap(s => s.phases.flatMap(p => p.topics.filter(t => t.videos.length).map(t => t.skill))));
    return SKILLS.filter(s => present.has(s));
  });
  protected readonly counts = computed(() => {
    const videos = this.scoped().flatMap(s => s.phases.flatMap(p => p.topics.flatMap(t => t.videos)));
    return {
      arabic: videos.filter(v => v.language === 'Arabic').length,
      english: videos.filter(v => v.language === 'English').length,
      watched: videos.filter(v => v.isWatched).length,
    };
  });
  protected readonly saved = createLoader(() => this.api.savedVideos());
  /** The open list is in the URL (?tab=saved), so it survives a refresh and can be linked to. */
  protected readonly tab = signal<Tab>(this.route.snapshot.queryParamMap.get('tab') === 'saved' ? 'saved' : 'all');
  protected readonly search = signal('');
  protected readonly skill = signal<SkillArea | ''>('');
  protected readonly unwatchedOnly = signal(false);
  protected readonly playing = signal<TopicVideo | null>(null);
  protected readonly busy = signal<string | null>(null);
  /** Phases opened by hand; while searching or filtering every matching phase is open. */
  /** Phases the learner opened or closed by hand. */
  private readonly toggled = signal(new Map<number, boolean>());
  protected readonly watch = watchUrl;
  /** Only built from a video id the API validated, so trusting it as a resource URL is safe. */
  protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.playing();
    return video ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl(video.videoId)) : null;
  });

  private matches(video: TopicVideo, q: string, topicMatches: boolean): boolean {
    return (!this.unwatchedOnly() || !video.isWatched)
      && (topicMatches || video.title.toLowerCase().includes(q) || video.channelTitle.toLowerCase().includes(q));
  }

  /** The chosen roadmap's sections with search, skill, language and watched filters applied. */
  protected readonly sections = computed(() => {
    const q = this.search().trim().toLowerCase();
    const skill = this.skill();
    return this.scoped().map(section => ({ ...section, phases: section.phases.map(phase => {
      const topics = phase.topics
        .filter(t => !skill || t.skill === skill)
        .map(t => {
          const topicMatches = !q || t.titleEn.toLowerCase().includes(q) || t.titleAr.includes(q);
          return { ...t, videos: this.languages.apply(t.videos).filter(v => this.matches(v, q, topicMatches)) };
        })
        .filter(t => t.videos.length > 0);
      return { ...phase, topics, count: topics.reduce((n, t) => n + t.videos.length, 0) };
    }).filter(p => p.topics.length > 0) })).filter(s => s.phases.length > 0);
  });
  protected readonly phases = computed(() => this.sections().flatMap(s => s.phases));

  protected readonly savedShown = computed<SavedVideo[]>(() => {
    const q = this.search().trim().toLowerCase();
    const topics = this.scopedTopics();
    const list = (this.saved.value() ?? []).filter(s => (!this.skill() || s.skill === this.skill()) && (!this.data.value() || topics.has(s.topicId)));
    const byLanguage = new Set(this.languages.apply(list.map(s => s.video)));
    return list.filter(s => byLanguage.has(s.video)
      && this.matches(s.video, q, !q || s.topicTitleEn.toLowerCase().includes(q) || s.topicTitleAr.includes(q)));
  });

  private readonly filtering = computed(() => !!(this.search().trim() || this.skill() || this.unwatchedOnly()));

  /** A phase is open when the learner opened it; untouched phases are open while filtering, otherwise only the first one. */
  protected isOpen(id: number): boolean {
    return this.toggled().get(id) ?? (this.filtering() || id === this.phases()[0]?.id);
  }

  protected toggle(id: number): void {
    const open = !this.isOpen(id);
    this.toggled.update(m => new Map(m).set(id, open));
  }

  protected setAll(open: boolean): void {
    this.toggled.set(new Map(this.scoped().flatMap(s => s.phases).map(p => [p.id, open])));
  }

  /** Switches the roadmap; a skill that this roadmap has no videos for is cleared so it can't hide everything. */
  protected setRoadmap(slug: string): void {
    this.picked.set(slug);
    if (this.skill() && !this.skills().includes(this.skill() as SkillArea)) this.skill.set('');
  }

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    if (tab === 'saved') void this.saved.reload();
    void this.router.navigate([], { relativeTo: this.route, queryParams: { tab: tab === 'saved' ? 'saved' : null }, replaceUrl: true });
  }

  /** Watched/saved from either list; both lists are kept in step. */
  protected async setFlag(topicId: number, video: TopicVideo, flag: keyof Flags): Promise<void> {
    const next: Flags = { isWatched: video.isWatched, isBookmarked: video.isBookmarked, [flag]: !video[flag] };
    this.busy.set(video.videoId);
    try {
      await this.api.setVideoProgress(topicId, video.videoId, next);
      if (this.data.value()) {
        this.data.update(lib => ({
          ...lib,
          watchedCount: lib.watchedCount + (flag === 'isWatched' && lib.phases.some(p => p.topics.some(t => t.videos.some(v => v.videoId === video.videoId)))
            ? (next.isWatched ? 1 : -1) : 0),
          phases: lib.phases.map(p => ({ ...p, topics: p.topics.map(t => ({ ...t, videos: t.videos.map(v => (v.videoId === video.videoId ? { ...v, ...next } : v)) })) })),
        }));
      }
      if (!next.isBookmarked) {
        if (this.saved.value()) this.saved.update(list => list.filter(s => s.video.videoId !== video.videoId));
      } else if (flag === 'isBookmarked') {
        void this.saved.reload();
      } else if (this.saved.value()) {
        this.saved.update(list => list.map(s => (s.video.videoId === video.videoId ? { ...s, video: { ...s.video, ...next } } : s)));
      }
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

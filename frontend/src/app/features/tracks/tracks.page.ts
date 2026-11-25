import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Track } from '../../core/models';
import { TrackStore } from '../../core/track.service';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

/**
 * Choose your roadmap: a card per roadmap with what it teaches, its technologies, its size and what you will be able
 * to do at the end. New learners land here at their first sign-in; everyone can come back to switch. Progress is kept
 * per topic, so switching loses nothing, and phases shared by two roadmaps count in both.
 */
@Component({
  selector: 'app-tracks-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, PageHeaderComponent, ProgressBarComponent,
    SkeletonComponent, ErrorStateComponent],
  styles: `
    :host { display: block; }
    .intro { margin: 0 0 20px; max-width: 70ch; }
    .track-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .track { display: flex; flex-direction: column; gap: 14px; padding: 20px; height: 100%; }
    .track.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    .track-head { display: flex; gap: 12px; align-items: flex-start; }
    .track-icon { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--surface-2); color: var(--accent); }
    .track-head h2 { margin: 0; font-size: 1.15rem; }
    .track-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .track p { margin: 0; color: var(--text-2); line-height: 1.7; }
    .outcome { display: flex; gap: 8px; align-items: flex-start; font-size: .92rem; }
    .outcome .icon { color: var(--success); flex: none; margin-top: 3px; }
    .tech { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .tech li { padding: 2px 10px; border: 1px solid var(--border); border-radius: 999px; font-size: .82rem; }
    .facts { display: flex; flex-wrap: wrap; gap: 6px 16px; color: var(--muted); font-size: .88rem; margin: 0; }
    .facts div { display: flex; gap: 4px; }
    .facts dt, .facts dd { margin: 0; }
    .facts dd { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--text); }
    .mine { display: flex; flex-direction: column; gap: 6px; font-size: .88rem; }
    .track-foot { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  `,
  template: `
    <app-page-header [title]="(first() ? 'tracks.firstTitle' : 'tracks.title') | t" [subtitle]="'tracks.subtitle' | t" />
    <p class="intro muted" data-tour="tracks-intro">{{ (first() ? 'tracks.firstIntro' : 'tracks.intro') | t }}</p>

    @if (loading()) {
      <div class="card"><app-skeleton [rows]="4" /></div>
    } @else if (error()) {
      <app-error-state [error]="error()" (retry)="reload()" />
    } @else {
      <ul class="track-grid" role="list" data-tour="tracks-list">
        @for (t of store.tracks(); track t.slug) {
          @let isActive = t.slug === store.activeSlug();
          <li>
            <article class="card track" [class.active]="isActive" [attr.aria-labelledby]="'track-' + t.slug">
              <div class="track-head">
                <span class="track-icon" aria-hidden="true"><app-icon [name]="t.icon" [size]="22" /></span>
                <div>
                  <h2 [id]="'track-' + t.slug">{{ t | loc: 'title' }}</h2>
                  <div class="track-badges">
                    @if (isActive) { <span class="badge badge-accent">{{ 'tracks.current' | t }}</span> }
                    @if (t.isDraft) { <span class="badge">{{ 'tracks.draft' | t }}</span> }
                    @if (t.sharedPhases > 0) { <span class="badge">{{ 'tracks.shared' | t: { n: t.sharedPhases } }}</span> }
                  </div>
                </div>
              </div>
              <p>{{ t | loc: 'summary' }}</p>
              <p class="outcome"><app-icon name="check-circle" [size]="16" /> {{ t | loc: 'outcome' }}</p>
              <ul class="tech" role="list" [attr.aria-label]="'tracks.technologies' | t">
                @for (tech of t.technologies; track tech) { <li><bdi dir="ltr">{{ tech }}</bdi></li> }
              </ul>
              <dl class="facts">
                <div><dt>{{ 'tracks.phases' | t }}</dt><dd>{{ t.phaseCount }}</dd></div>
                <div><dt>{{ 'tracks.topics' | t }}</dt><dd>{{ t.topicCount }}</dd></div>
                <div><dt>{{ 'tracks.time' | t }}</dt><dd>{{ t.minutes | duration }}</dd></div>
              </dl>
              @if (t.doneTopics > 0) {
                <div class="mine">
                  <span>{{ 'tracks.done' | t: { done: t.doneTopics, total: t.topicCount } }}</span>
                  <app-progress-bar [value]="percent(t)" [small]="true" [label]="t | loc: 'title'" />
                </div>
              }
              <div class="track-foot">
                @if (isActive) {
                  <a class="btn btn-secondary" routerLink="/roadmap"><app-icon name="map" [size]="16" /> {{ 'tracks.open' | t }}</a>
                } @else {
                  <button type="button" class="btn btn-primary" (click)="choose(t)" [disabled]="busy() !== null">
                    <app-icon name="arrow-right" class="flip-rtl" [size]="16" /> {{ 'tracks.choose' | t }}
                  </button>
                }
              </div>
            </article>
          </li>
        }
      </ul>
      <p class="muted small" data-tour="tracks-switch">{{ 'tracks.switchNote' | t }}</p>
    }
  `,
})
export default class TracksPage {
  protected readonly store = inject(TrackStore);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  /** Opened by the first-sign-in redirect: explain why, then go back where the learner was heading. */
  protected readonly first = signal(this.params.get('first') === '1');
  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly busy = signal<string | null>(null);

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const t = await this.store.load(true);
    if (!t) this.error.set(new ApiError(0, 'network', 'Could not load the roadmaps.'));
    this.loading.set(false);
  }

  protected percent(t: Track): number {
    return t.topicCount ? (t.doneTopics / t.topicCount) * 100 : 0;
  }

  protected async choose(t: Track): Promise<void> {
    this.busy.set(t.slug);
    try {
      await this.store.choose(t.slug);
      this.toast.success(this.i18n.t('tracks.chosen', { name: this.i18n.pick(t.titleEn, t.titleAr) }));
      const back = this.params.get('returnUrl');
      await this.router.navigateByUrl(back && back.startsWith('/') && !back.startsWith('//') && !back.startsWith('/tracks') ? back : '/roadmap');
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

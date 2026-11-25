import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Track, Tracks } from './models';

/**
 * The roadmaps and the one the learner follows, loaded once per sign-in and shared by the picker page, the roadmap
 * header and the first-sign-in redirect.
 */
@Injectable({ providedIn: 'root' })
export class TrackStore {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly state = signal<Tracks | null>(null);
  private loading: Promise<Tracks | null> | null = null;
  private loadedFor: string | null = null;

  readonly tracks = computed(() => this.state()?.tracks ?? []);
  readonly activeSlug = computed(() => this.state()?.activeSlug ?? null);
  readonly active = computed<Track | null>(() => this.tracks().find(t => t.slug === this.activeSlug()) ?? null);
  /** True when there is a real choice to make and the learner hasn't made it yet (a new account). */
  readonly needsChoice = computed(() => {
    const s = this.state();
    return !!s && s.chosenSlug === null && s.tracks.filter(t => !t.isDraft).length > 1;
  });

  /** Loads the roadmaps for the signed-in account (again after a different account signs in). */
  load(force = false): Promise<Tracks | null> {
    const id = this.auth.account()?.id ?? null;
    if (!force && this.loading && this.loadedFor === id) return this.loading;
    this.loadedFor = id;
    this.loading = Promise.resolve().then(() => this.api.tracks()).then(t => { this.state.set(t); return t; }).catch(() => { this.loading = null; return null; });
    return this.loading;
  }

  async choose(slug: string): Promise<void> {
    const t = await this.api.chooseTrack(slug);
    this.state.set(t);
    this.loading = Promise.resolve(t);
  }
}

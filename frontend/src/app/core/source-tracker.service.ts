import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, effect, inject } from '@angular/core';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';
import { SOURCE_KEY, VISIT_KEY, rememberedSource, sourceFromUrl } from './source';

export { rememberedSource, sourceFromUrl } from './source';

/**
 * Tells the admin report which links bring people: one anonymous visit per browser session for guests, and the same
 * source with a new account (see AuthService.signUp). Only the source word is sent, never the URL or anything about
 * the person, and a failed request is ignored.
 */
@Injectable({ providedIn: 'root' })
export class SourceTracker {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);

  start(search = globalThis.location?.search ?? ''): void {
    const source = sourceFromUrl(search);
    try {
      if (source && !sessionStorage.getItem(SOURCE_KEY)) sessionStorage.setItem(SOURCE_KEY, source);
    } catch { /* storage blocked: the visit is still counted below, as direct */ }

    const ref = effect(() => {
      if (!this.auth.ready()) return;
      ref.destroy();
      if (this.auth.account()) return; // signed-in learners are counted by UsageTracker instead
      try {
        if (sessionStorage.getItem(VISIT_KEY)) return;
        sessionStorage.setItem(VISIT_KEY, '1');
      } catch { /* count it anyway */ }
      this.http.post(`${this.base}/usage/visits`, { source: rememberedSource() ?? source }).subscribe({ error: () => undefined });
    }, { injector: this.injector });
  }
}

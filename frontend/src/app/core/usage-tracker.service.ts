import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';

/**
 * The route pattern of a page, such as "topics/:id": the router's configured paths joined, never the real URL,
 * so no ids, handles or query strings leave the browser.
 */
export function routePattern(root: ActivatedRouteSnapshot): string {
  const parts: string[] = [];
  for (let r: ActivatedRouteSnapshot | null = root; r; r = r.firstChild) {
    const path = r.routeConfig?.path;
    if (path) parts.push(path);
  }
  return parts.join('/');
}

/**
 * Counts page views for the admin usage report: on each page change of a signed-in learner it sends the route
 * pattern. Nothing about the person is sent, and a failed request is ignored.
 */
@Injectable({ providedIn: 'root' })
export class UsageTracker {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private last: string | null = null;

  start(destroyRef = inject(DestroyRef)): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(destroyRef)).subscribe(() => {
      if (!this.auth.account()) return;
      const route = routePattern(this.router.routerState.snapshot.root);
      // A tab or filter change keeps the same page (only the query changes), so it is not a new view.
      const path = this.router.url.split(/[?#]/)[0];
      if (path === this.last) return;
      this.last = path;
      this.http.post(`${this.base}/usage/page-views`, { route }).subscribe({ error: () => undefined });
    });
  }
}

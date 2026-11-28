import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/** Pages a signed-out visitor opens next from the public front page. */
const PUBLIC_NEXT = new Set(['sign-up', 'sign-in', 'pre-roadmap']);

/**
 * Downloads lazy pages in the background a few seconds after start-up, so a click doesn't wait for the page's code
 * from the (slow) host. Signed-in learners get every page; visitors only the account pages and Before the roadmap,
 * so a quick look at the front page doesn't download the whole app.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloading implements PreloadingStrategy {
  private readonly auth = inject(AuthService);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return timer(3000).pipe(switchMap(() =>
      this.auth.account() || PUBLIC_NEXT.has(route.path ?? '') ? load() : EMPTY));
  }
}

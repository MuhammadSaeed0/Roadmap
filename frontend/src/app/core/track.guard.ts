import { inject } from '@angular/core';
import { CanActivateFn, NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from './auth.service';
import { TrackStore } from './track.service';

/**
 * First sign-in: a new learner who hasn't picked a roadmap (and has more than one to pick from) is taken to the picker,
 * and comes back here afterwards. It never holds up the page: the page opens straight away, and the redirect happens
 * only once the roadmaps have loaded, after this navigation has finished, and only if the learner is still on the page.
 */
export const trackChoiceGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const store = inject(TrackStore);
  const router = inject(Router);
  const path = (url: string) => url.split(/[?#]/)[0];
  const redirect = () => {
    if (!store.needsChoice() || path(router.url) !== path(state.url)) return;
    void router.navigate(['/tracks'], { queryParams: { first: 1, returnUrl: path(state.url) === '/' ? null : state.url }, replaceUrl: true });
  };
  // The session may still be loading at the first navigation: wait for it, then for the roadmaps.
  void auth.restore().then(() => auth.approved() ? store.load() : null).then(loaded => {
    if (!loaded) return;
    if (!router.currentNavigation()) return redirect();
    router.events.pipe(filter(e => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError), take(1))
      .subscribe(redirect);
  });
  return true;
};

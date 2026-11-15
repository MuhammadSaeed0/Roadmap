import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

/** /progress?tab=overview (old links and bookmarks) opens the Progress tab of the Developer Level page. */
export const progressOverviewRedirect: CanActivateFn = (route: ActivatedRouteSnapshot) =>
  route.queryParamMap.get('tab') === 'overview'
    ? inject(Router).createUrlTree(['/skills'], { queryParams: { tab: 'progress' } })
    : true;

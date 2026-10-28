import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Pages that need an account. Without one, the user goes to the sign-in page, which
 * brings them back here afterwards. The API enforces the same rule on every request,
 * so this guard is about navigation, not protection.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.restore();
  if (auth.approved()) return true;
  // Signed in but not verified or approved yet (or blocked): show what's going on.
  if (auth.account()) return router.createUrlTree(['/account-status']);
  return router.createUrlTree(['/sign-in'], { queryParams: state.url !== '/' ? { returnUrl: state.url } : {} });
};

/** The account status page: for signed-in accounts that can't use the app yet. */
export const accountStatusGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.restore();
  if (!auth.account()) return router.createUrlTree(['/sign-in']);
  return auth.approved() ? router.createUrlTree(['/']) : true;
};

/** The admin area. Only decides navigation: every admin API call is authorized on the server. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.restore();
  return auth.isAdmin() ? true : router.createUrlTree(['/']);
};

/** Sign-in, sign-up and password recovery: a signed-in user goes straight to the app. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.restore();
  if (!auth.account()) return true;
  return router.createUrlTree([auth.approved() ? '/' : '/account-status']);
};

/**
 * The returnUrl query parameter, accepted only when it is a path inside this app,
 * so a crafted sign-in link can't send the user to another site.
 */
export function safeReturnUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (/^\/(sign-in|sign-up|forgot-password|reset-password|verify-email|account-status)\b/.test(value)) return '/';
  return value;
}

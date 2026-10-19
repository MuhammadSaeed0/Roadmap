import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { SupabaseService } from './supabase.service';

/**
 * Lets a route through only when someone is signed in. It waits for Supabase to
 * finish restoring the stored session first, so a refresh doesn't bounce a signed-in
 * user to the sign-in page.
 */
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  if (!supabase.ready()) {
    await firstValueFrom(toObservable(supabase.ready).pipe(filter(Boolean), take(1)));
  }
  return supabase.user() ? true : router.createUrlTree(['/sign-in']);
};

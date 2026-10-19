import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { SupabaseService } from './supabase.service';

/**
 * Lets every page open without an explicit sign-in. It waits for Supabase to restore
 * the stored session, then makes sure there is one: an anonymous session is created
 * on the first visit. Row-level security still keeps each browser's data private.
 * If anonymous sign-in is turned off in Supabase, it falls back to the sign-in page.
 */
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  if (!supabase.ready()) {
    await firstValueFrom(toObservable(supabase.ready).pipe(filter(Boolean), take(1)));
  }
  try {
    await supabase.ensureSession();
    return true;
  } catch {
    return router.createUrlTree(['/sign-in']);
  }
};

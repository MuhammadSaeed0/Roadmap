import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ApiError } from './api-error';
import { API_BASE_URL } from './api.service';

export type AccountStatus = 'PendingEmailVerification' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Suspended';

/** The signed-in account, as returned by the API. `isAdmin` only decides what to show; the API checks every admin call. */
export interface Account {
  id: string; email: string; fullName: string; createdAt: string;
  status: AccountStatus; emailVerified: boolean; isAdmin: boolean; isOwner: boolean; statusReason: string | null;
}

/**
 * Email + password accounts, backed by ASP.NET Core Identity in the API. The session is an
 * HttpOnly cookie set by the API: JavaScript never sees it, so it can't be stolen by a script.
 * The API checks it on every request, so the guards here only decide where to navigate.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  /** The signed-in account, or null. */
  readonly account = signal<Account | null>(null);
  /** True once the API has said whether the cookie is still valid, so guards don't redirect too early. */
  readonly ready = signal(false);
  readonly displayName = computed(() => this.account()?.fullName.trim() || this.account()?.email || '');
  /** Verified and approved by an administrator: the only state that can use the app. */
  readonly approved = computed(() => this.account()?.status === 'Approved');
  readonly isAdmin = computed(() => this.approved() && !!this.account()?.isAdmin);

  private restoring: Promise<void> | null = null;

  /** Asks the API who is signed in (after a refresh, the cookie is all we have). Runs once; offline counts as signed out. */
  restore(): Promise<void> {
    this.restoring ??= this.call<Account>('GET', '/auth/me')
      .then((account) => this.account.set(account))
      .catch(() => this.account.set(null))
      .finally(() => this.ready.set(true));
    return this.restoring;
  }

  /** Re-reads the account (its status may have changed: verified elsewhere, approved, suspended…). */
  async refresh(): Promise<Account | null> {
    try {
      this.account.set(await this.call<Account>('GET', '/auth/me'));
    } catch (e) {
      if (ApiError.from(e).status === 401) this.account.set(null);
      else throw e;
    }
    return this.account();
  }

  async signUp(fullName: string, email: string, password: string): Promise<void> {
    this.account.set(await this.call<Account>('POST', '/auth/register', { fullName, email, password }));
  }

  async signIn(email: string, password: string): Promise<void> {
    this.account.set(await this.call<Account>('POST', '/auth/login', { email, password }));
  }

  async signOut(): Promise<void> {
    try {
      await this.call<void>('POST', '/auth/logout', {});
    } finally {
      this.account.set(null);
    }
  }

  /** The API answers the same way whether or not the address has an account. */
  forgotPassword(email: string): Promise<void> {
    return this.call<void>('POST', '/auth/forgot-password', { email });
  }

  /** The one-time token from the reset email identifies the account. */
  resetPassword(token: string, newPassword: string): Promise<void> {
    return this.call<void>('POST', '/auth/reset-password', { token, newPassword });
  }

  /** Redeems the token from the verification email; works signed in or not. Returns the account's new status. */
  async verifyEmail(token: string): Promise<AccountStatus> {
    const result = await this.call<{ status: AccountStatus }>('POST', '/auth/verify-email', { token });
    if (this.account()) await this.refresh().catch(() => undefined);
    return result.status;
  }

  resendVerification(): Promise<void> {
    return this.call<void>('POST', '/auth/resend-verification', {});
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.call<void>('POST', '/auth/change-password', { currentPassword, newPassword });
  }

  /** Called by the interceptor when the API says the session is gone (expired, revoked, signed out elsewhere). */
  sessionEnded(): void {
    if (this.account()) this.account.set(null);
  }

  /** Called by the interceptor when the API says the account can't use the app (pending, rejected, suspended). */
  accessBlocked(): void {
    if (this.approved()) void this.refresh().catch(() => undefined);
  }

  private async call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.request<T>(method, this.base + path, { body }));
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}

/**
 * Sends the auth cookie with every API request (the Angular dev server is on another port),
 * and notices when the API rejects the session so the app can return to the sign-in page.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL);
  if (!request.url.startsWith(base)) return next(request);
  const auth = inject(AuthService);
  return next(request.clone({ withCredentials: true })).pipe(
    catchError((error: unknown) => {
      // /auth/* answers 401 for a wrong password too; that isn't an ended session.
      if (error instanceof HttpErrorResponse && !request.url.startsWith(`${base}/auth/`)) {
        if (error.status === 401) auth.sessionEnded();
        // Suspended or demoted while the app was open: re-read the account so the app shows its status page.
        if (error.status === 403 && /^account_/.test(String((error.error as { code?: string } | null)?.code ?? ''))) auth.accessBlocked();
      }
      return throwError(() => error);
    }),
  );
};

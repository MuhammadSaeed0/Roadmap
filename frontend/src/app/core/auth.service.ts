import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ApiError } from './api-error';
import { API_BASE_URL } from './api.service';

/** The signed-in account, as returned by the API. */
export interface Account { id: string; email: string; fullName: string; createdAt: string; }

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

  private restoring: Promise<void> | null = null;

  /** Asks the API who is signed in (after a refresh, the cookie is all we have). Runs once; offline counts as signed out. */
  restore(): Promise<void> {
    this.restoring ??= this.call<Account>('GET', '/auth/me')
      .then((account) => this.account.set(account))
      .catch(() => this.account.set(null))
      .finally(() => this.ready.set(true));
    return this.restoring;
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

  resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    return this.call<void>('POST', '/auth/reset-password', { email, token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.call<void>('POST', '/auth/change-password', { currentPassword, newPassword });
  }

  /** Called by the interceptor when the API says the session is gone (expired, revoked, signed out elsewhere). */
  sessionEnded(): void {
    if (this.account()) this.account.set(null);
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
      if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.startsWith(`${base}/auth/`)) auth.sessionEnded();
      return throwError(() => error);
    }),
  );
};

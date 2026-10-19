import { HttpErrorResponse } from '@angular/common/http';

/**
 * A normalised API error. The backend returns RFC 7807 ProblemDetails with a stable
 * `code` (e.g. "attempt_required"); the UI translates that code into EN/AR text.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }

  get isOffline(): boolean {
    return this.status === 0;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return new ApiError(0, 'offline', 'The API is not reachable.');
      const body = (error.error ?? {}) as { code?: string; title?: string; detail?: string; errors?: Record<string, string[]> };
      const code = body.code ?? (error.status === 404 ? 'not_found' : error.status >= 500 ? 'server_error' : 'request_failed');
      return new ApiError(error.status, code, body.detail ?? body.title ?? error.message, normaliseKeys(body.errors ?? {}));
    }
    return new ApiError(-1, 'unknown', error instanceof Error ? error.message : String(error));
  }
}

/** ASP.NET Core may send "Title" or "title"; form controls use camelCase. */
function normaliseKeys(errors: Record<string, string[]>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(errors)) {
    result[key.charAt(0).toLowerCase() + key.slice(1)] = messages;
  }
  return result;
}

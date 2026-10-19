import { HttpErrorResponse } from '@angular/common/http';

export function toMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the server. Is the API running?';
    if (error.status === 404) return 'Not found.';
    const code = error.error?.code as string | undefined;   // e.g. 'attempt_required'
    return code ? translateCode(code) : `Server error (${error.status}).`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

try {
  await saveNote(form.value);
} catch (e: unknown) {
  toast.error(toMessage(e));
} finally {
  saving.set(false);
}

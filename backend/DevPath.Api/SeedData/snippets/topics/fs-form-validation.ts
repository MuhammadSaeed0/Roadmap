import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

/** Copies ASP.NET Core ValidationProblemDetails errors onto matching form controls. */
export function applyServerErrors(form: FormGroup, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return false;
  const errors = (error.error?.errors ?? {}) as Record<string, string[]>;

  let applied = false;
  for (const [field, messages] of Object.entries(errors)) {
    // API may send "Name" or "name" — normalise to camelCase
    const key = field.charAt(0).toLowerCase() + field.slice(1);
    const control = form.get(key);
    if (control) {
      control.setErrors({ server: messages[0] });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied;
}

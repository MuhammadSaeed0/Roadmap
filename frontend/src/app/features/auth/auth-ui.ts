import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';

export const PASSWORD_MIN_LENGTH = 8;

/** At least 8 characters with a letter and a digit. The API enforces the same rules. */
export const passwordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null; // `required` reports empty values
  const strong = value.length >= PASSWORD_MIN_LENGTH && /\p{L}/u.test(value) && /\d/.test(value);
  return strong ? null : { passwordWeak: true };
};

/** Group validator: `confirm` must equal `password`. The error is set on the group. */
export function matchingPasswords(password = 'password', confirm = 'confirmPassword'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(password)?.value;
    const b = group.get(confirm)?.value;
    return a && b && a !== b ? { passwordMismatch: true } : null;
  };
}

/** The `auth.errors.*` key suffix for a failed auth call: the API's error code, "offline", or "generic". */
export function authErrorKey(i18n: I18nService, error: unknown): string {
  const e = ApiError.from(error);
  const code = e.isOffline ? 'offline' : e.code;
  return i18n.has(`auth.errors.${code}`) ? code : 'generic';
}

/** Trimmed, lower-cased email. */
export const normaliseEmail = (value: string): string => value.trim().toLowerCase();

/** Centred card used by every account page, with the app's brand mark on top. */
@Component({
  selector: 'app-auth-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card auth-card" [attr.aria-labelledby]="headingId">
      <span class="brand-mark auth-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="40" height="40"><defs><linearGradient id="auth-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--accent)" /><stop offset="1" stop-color="var(--accent-2)" /></linearGradient></defs>
          <rect width="32" height="32" rx="9" fill="url(#auth-bg)" />
          <path d="M9 21.5 14 16l-5-5.5M16.5 22h7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <h1 [id]="headingId" class="auth-title" tabindex="-1">{{ heading() }}</h1>
      @if (subtitle()) { <p class="auth-subtitle">{{ subtitle() }}</p> }
      <ng-content />
    </section>
  `,
})
export class AuthCardComponent {
  readonly heading = input.required<string>();
  readonly subtitle = input('');
  protected readonly headingId = 'auth-heading';
}

/** Password input with a show/hide toggle. The toggle is a real button, so it works with the keyboard. */
@Component({
  selector: 'app-password-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe],
  template: `
    <div class="password-input">
      <input class="input" [id]="inputId()" [type]="visible() ? 'text' : 'password'" [formControl]="control()"
             [attr.autocomplete]="autocomplete()" [attr.aria-invalid]="invalid()" [attr.aria-describedby]="describedBy() || null"
             autocapitalize="off" spellcheck="false" />
      <button type="button" class="icon-btn password-toggle" (click)="visible.set(!visible())"
              [attr.aria-label]="(visible() ? 'auth.hidePassword' : 'auth.showPassword') | t" [attr.aria-pressed]="visible()"
              [attr.aria-controls]="inputId()">
        <app-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="17" />
      </button>
    </div>
  `,
})
export class PasswordInputComponent {
  readonly control = input.required<FormControl<string>>();
  readonly inputId = input.required<string>();
  readonly autocomplete = input<'current-password' | 'new-password'>('current-password');
  readonly invalid = input(false);
  readonly describedBy = input('');
  protected readonly visible = signal(false);
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey, matchingPasswords, PasswordInputComponent, passwordStrength } from './auth-ui';

/**
 * Opened from a password-reset link (/reset-password?token=…). The token is single-use,
 * expires after an hour and identifies the account; the API checks it, this page only collects the new password.
 */
@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe, AuthCardComponent, PasswordInputComponent],
  template: `
    <app-auth-card [heading]="'auth.resetTitle' | t" [subtitle]="token ? ('auth.resetBodyGeneric' | t) : ''">
      @if (!token) {
        <div class="callout callout-danger" role="alert"><app-icon name="alert" /><p>{{ 'auth.errors.invalid_token' | t }}</p></div>
        <a routerLink="/forgot-password" class="btn btn-primary btn-block">{{ 'auth.sendReset' | t }}</a>
      } @else {
        @if (errorCode(); as code) {
          <div class="callout callout-danger" role="alert">
            <app-icon name="alert" />
            <div>
              <p>{{ 'auth.errors.' + code | t }}</p>
              @if (code === 'invalid_token' || code === 'token_used' || code === 'token_expired') { <a routerLink="/forgot-password">{{ 'auth.sendReset' | t }}</a> }
            </div>
          </div>
        }
        <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="rp-password">{{ 'auth.newPassword' | t }}</label>
            <app-password-input [control]="form.controls.password" inputId="rp-password" autocomplete="new-password"
                                [invalid]="showError('password')" describedBy="rp-password-help" />
            <small id="rp-password-help" [class]="showError('password') ? 'field-error' : 'muted small'">
              {{ (form.controls.password.hasError('required') && showError('password') ? 'validation.required' : 'auth.passwordHint') | t }}
            </small>
          </div>
          <div class="field">
            <label for="rp-confirm">{{ 'auth.confirmPassword' | t }}</label>
            <app-password-input [control]="form.controls.confirmPassword" inputId="rp-confirm" autocomplete="new-password"
                                [invalid]="showError('confirmPassword') || mismatch()" describedBy="rp-confirm-err" />
            @if (showError('confirmPassword')) {
              <small id="rp-confirm-err" class="field-error">{{ 'validation.required' | t }}</small>
            } @else if (mismatch()) {
              <small id="rp-confirm-err" class="field-error">{{ 'validation.passwordMismatch' | t }}</small>
            }
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="busy()">
            @if (busy()) { <app-icon name="refresh" class="spin" [size]="16" /> {{ 'common.saving' | t }} }
            @else { {{ 'auth.savePassword' | t }} }
          </button>
        </form>
      }
      <p class="auth-switch"><a routerLink="/sign-in">{{ 'auth.backToSignIn' | t }}</a></p>
    </app-auth-card>
  `,
})
export default class ResetPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;
  protected readonly token = this.query.get('token') ?? '';

  protected readonly busy = signal(false);
  protected readonly errorCode = signal<string | null>(null);
  private readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, Validators.maxLength(128), passwordStrength]],
    confirmPassword: ['', Validators.required],
  }, { validators: matchingPasswords() });

  protected showError(name: 'password' | 'confirmPassword'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected mismatch(): boolean {
    return this.form.hasError('passwordMismatch') && (this.form.controls.confirmPassword.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.errorCode.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    try {
      await this.auth.resetPassword(this.token, this.form.controls.password.value);
      this.toast.success(this.i18n.t('auth.passwordReset'));
      await this.router.navigateByUrl('/sign-in');
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
    } finally {
      this.busy.set(false);
    }
  }
}

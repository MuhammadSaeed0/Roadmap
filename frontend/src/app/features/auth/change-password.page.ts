import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey, matchingPasswords, PasswordInputComponent, passwordStrength } from './auth-ui';

/** Changes the signed-in account's password (needs the current one). Other devices are signed out. */
@Component({
  selector: 'app-change-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe, AuthCardComponent, PasswordInputComponent],
  template: `
    <app-auth-card [heading]="'auth.changePassword' | t" [subtitle]="auth.account()?.email ?? ''">
      @if (errorCode(); as code) {
        <div class="callout callout-danger" role="alert"><app-icon name="alert" /><p>{{ 'auth.errors.' + code | t }}</p></div>
      }
      <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="cp-current">{{ 'auth.currentPassword' | t }}</label>
          <app-password-input [control]="form.controls.currentPassword" inputId="cp-current" autocomplete="current-password"
                              [invalid]="showError('currentPassword')" describedBy="cp-current-err" />
          @if (showError('currentPassword')) { <small id="cp-current-err" class="field-error">{{ 'validation.required' | t }}</small> }
        </div>
        <div class="field">
          <label for="cp-password">{{ 'auth.newPassword' | t }}</label>
          <app-password-input [control]="form.controls.password" inputId="cp-password" autocomplete="new-password"
                              [invalid]="showError('password')" describedBy="cp-password-help" />
          <small id="cp-password-help" [class]="showError('password') ? 'field-error' : 'muted small'">
            {{ (form.controls.password.hasError('required') && showError('password') ? 'validation.required' : 'auth.passwordHint') | t }}
          </small>
        </div>
        <div class="field">
          <label for="cp-confirm">{{ 'auth.confirmPassword' | t }}</label>
          <app-password-input [control]="form.controls.confirmPassword" inputId="cp-confirm" autocomplete="new-password"
                              [invalid]="showError('confirmPassword') || mismatch()" describedBy="cp-confirm-err" />
          @if (showError('confirmPassword')) {
            <small id="cp-confirm-err" class="field-error">{{ 'validation.required' | t }}</small>
          } @else if (mismatch()) {
            <small id="cp-confirm-err" class="field-error">{{ 'validation.passwordMismatch' | t }}</small>
          }
        </div>
        <button type="submit" class="btn btn-primary btn-block" [disabled]="busy()">
          @if (busy()) { <app-icon name="refresh" class="spin" [size]="16" /> {{ 'common.saving' | t }} }
          @else { {{ 'auth.savePassword' | t }} }
        </button>
      </form>
      <p class="auth-switch"><a routerLink="/settings">{{ 'common.cancel' | t }}</a></p>
    </app-auth-card>
  `,
})
export default class ChangePasswordPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly busy = signal(false);
  protected readonly errorCode = signal<string | null>(null);
  private readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.maxLength(128)]],
    password: ['', [Validators.required, Validators.maxLength(128), passwordStrength]],
    confirmPassword: ['', Validators.required],
  }, { validators: matchingPasswords() });

  protected showError(name: 'currentPassword' | 'password' | 'confirmPassword'): boolean {
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
      const { currentPassword, password } = this.form.getRawValue();
      await this.auth.changePassword(currentPassword, password);
      this.toast.success(this.i18n.t('auth.passwordSaved'));
      await this.router.navigateByUrl('/settings');
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
      this.form.controls.currentPassword.reset();
    } finally {
      this.busy.set(false);
    }
  }
}

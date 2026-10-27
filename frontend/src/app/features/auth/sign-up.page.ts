import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeReturnUrl } from '../../core/auth.guard';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey, matchingPasswords, normaliseEmail, PasswordInputComponent, passwordStrength } from './auth-ui';

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword';

/** Creates an account. Every new account starts with empty progress, notes and videos. */
@Component({
  selector: 'app-sign-up-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe, AuthCardComponent, PasswordInputComponent],
  template: `
    <app-auth-card [heading]="'auth.signUpTitle' | t" [subtitle]="'auth.signUpBody' | t">
        @if (errorCode(); as code) {
          <div class="callout callout-danger" role="alert">
            <app-icon name="alert" />
            <div>
              <p>{{ 'auth.errors.' + code | t }}</p>
              @if (code === 'email_taken') {
                <a routerLink="/sign-in" [queryParams]="returnParams">{{ 'auth.signInLink' | t }}</a>
              }
            </div>
          </div>
        }

        <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="su-name">{{ 'auth.fullName' | t }}</label>
            <input id="su-name" class="input" formControlName="fullName" autocomplete="name" maxlength="100"
                   [attr.aria-invalid]="showError('fullName')" aria-describedby="su-name-err" />
            @if (showError('fullName')) {
              <small id="su-name-err" class="field-error">
                {{ form.controls.fullName.hasError('maxlength') ? ('validation.maxLength' | t: { max: 100 }) : ('validation.required' | t) }}
              </small>
            }
          </div>

          <div class="field">
            <label for="su-email">{{ 'auth.email' | t }}</label>
            <input id="su-email" type="email" class="input" formControlName="email" autocomplete="email" inputmode="email"
                   autocapitalize="off" spellcheck="false" [attr.aria-invalid]="showError('email')" aria-describedby="su-email-err" />
            @if (showError('email')) {
              <small id="su-email-err" class="field-error">
                {{ (form.controls.email.hasError('required') ? 'validation.required' : 'validation.email') | t }}
              </small>
            }
          </div>

          <div class="field">
            <label for="su-password">{{ 'auth.password' | t }}</label>
            <app-password-input [control]="form.controls.password" inputId="su-password" autocomplete="new-password"
                                [invalid]="showError('password')" describedBy="su-password-help" />
            <small id="su-password-help" [class]="showError('password') ? 'field-error' : 'muted small'">
              {{ (form.controls.password.hasError('required') && showError('password') ? 'validation.required' : 'auth.passwordHint') | t }}
            </small>
          </div>

          <div class="field">
            <label for="su-confirm">{{ 'auth.confirmPassword' | t }}</label>
            <app-password-input [control]="form.controls.confirmPassword" inputId="su-confirm" autocomplete="new-password"
                                [invalid]="showError('confirmPassword') || mismatch()" describedBy="su-confirm-err" />
            @if (showError('confirmPassword')) {
              <small id="su-confirm-err" class="field-error">{{ 'validation.required' | t }}</small>
            } @else if (mismatch()) {
              <small id="su-confirm-err" class="field-error">{{ 'validation.passwordMismatch' | t }}</small>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="busy()">
            @if (busy()) { <app-icon name="refresh" class="spin" [size]="16" /> {{ 'auth.signingUp' | t }} }
            @else { {{ 'auth.signUp' | t }} }
          </button>
        </form>

        <p class="auth-switch">
          {{ 'auth.haveAccount' | t }}
          <a routerLink="/sign-in" [queryParams]="returnParams">{{ 'auth.signInLink' | t }}</a>
        </p>
    </app-auth-card>
  `,
})
export default class SignUpPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  private readonly returnUrl = safeReturnUrl(inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl'));
  protected readonly returnParams = this.returnUrl !== '/' ? { returnUrl: this.returnUrl } : {};

  protected readonly busy = signal(false);
  protected readonly errorCode = signal<string | null>(null);
  private readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(128), passwordStrength]],
    confirmPassword: ['', Validators.required],
  }, { validators: matchingPasswords() });

  protected showError(name: Field): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected mismatch(): boolean {
    const confirm = this.form.controls.confirmPassword;
    return this.form.hasError('passwordMismatch') && (confirm.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.errorCode.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    const { fullName, email, password } = this.form.getRawValue();
    try {
      await this.auth.signUp(fullName.trim(), normaliseEmail(email), password);
      this.toast.success(this.i18n.t('auth.welcome', { name: this.auth.displayName() }));
      await this.router.navigateByUrl(this.returnUrl);
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
    } finally {
      this.busy.set(false);
    }
  }
}

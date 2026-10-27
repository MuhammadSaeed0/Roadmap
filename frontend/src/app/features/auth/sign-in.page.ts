import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { safeReturnUrl } from '../../core/auth.guard';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey, normaliseEmail, PasswordInputComponent } from './auth-ui';

/** Email + password sign-in. Reached from the auth guard, which passes the page to return to. */
@Component({
  selector: 'app-sign-in-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe, AuthCardComponent, PasswordInputComponent],
  template: `
    <app-auth-card [heading]="'auth.signInTitle' | t" [subtitle]="'auth.signInBody' | t">
      @if (errorCode(); as code) {
        <div class="callout callout-danger" role="alert"><app-icon name="alert" /><p>{{ 'auth.errors.' + code | t }}</p></div>
      }

      <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="si-email">{{ 'auth.email' | t }}</label>
          <input id="si-email" type="email" class="input" formControlName="email" autocomplete="email" inputmode="email"
                 autocapitalize="off" spellcheck="false" [attr.aria-invalid]="showError('email')" aria-describedby="si-email-err" />
          @if (showError('email')) {
            <small id="si-email-err" class="field-error">
              {{ (form.controls.email.hasError('required') ? 'validation.required' : 'validation.email') | t }}
            </small>
          }
        </div>

        <div class="field">
          <div class="row-between">
            <label for="si-password">{{ 'auth.password' | t }}</label>
            <a routerLink="/forgot-password" class="small">{{ 'auth.forgot' | t }}</a>
          </div>
          <app-password-input [control]="form.controls.password" inputId="si-password" autocomplete="current-password"
                              [invalid]="showError('password')" describedBy="si-password-err" />
          @if (showError('password')) {
            <small id="si-password-err" class="field-error">{{ 'validation.required' | t }}</small>
          }
        </div>

        <button type="submit" class="btn btn-primary btn-block" [disabled]="busy()">
          @if (busy()) { <app-icon name="refresh" class="spin" [size]="16" /> {{ 'auth.signingIn' | t }} }
          @else { {{ 'auth.signIn' | t }} }
        </button>
      </form>

      <p class="auth-switch">
        {{ 'auth.noAccount' | t }}
        <a routerLink="/sign-up" [queryParams]="returnParams">{{ 'auth.createOne' | t }}</a>
      </p>
    </app-auth-card>
  `,
})
export default class SignInPage {
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
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  protected showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.errorCode.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(normaliseEmail(email), password);
      this.toast.success(this.i18n.t('auth.welcome', { name: this.auth.displayName() }));
      await this.router.navigateByUrl(this.returnUrl);
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
      this.form.controls.password.reset();
    } finally {
      this.busy.set(false);
    }
  }
}

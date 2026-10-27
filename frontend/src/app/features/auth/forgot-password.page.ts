import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey, normaliseEmail } from './auth-ui';

/**
 * Sends a password-reset link. The confirmation message is the same whether or not an
 * account exists, so this page can't be used to find out who has an account.
 */
@Component({
  selector: 'app-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe, AuthCardComponent],
  template: `
    <app-auth-card [heading]="'auth.forgotTitle' | t" [subtitle]="'auth.forgotBody' | t">
      @if (sentTo(); as email) {
        <div class="callout callout-success" role="status">
          <app-icon name="mail" /><p>{{ 'auth.resetSent' | t: { email } }}</p>
        </div>
      } @else {
        @if (errorCode(); as code) {
          <div class="callout callout-danger" role="alert"><app-icon name="alert" /><p>{{ 'auth.errors.' + code | t }}</p></div>
        }
        <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="fp-email">{{ 'auth.email' | t }}</label>
            <input id="fp-email" type="email" class="input" formControlName="email" autocomplete="email" inputmode="email"
                   autocapitalize="off" spellcheck="false" [attr.aria-invalid]="showError()" aria-describedby="fp-email-err" />
            @if (showError()) {
              <small id="fp-email-err" class="field-error">
                {{ (form.controls.email.hasError('required') ? 'validation.required' : 'validation.email') | t }}
              </small>
            }
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="busy()">
            @if (busy()) { <app-icon name="refresh" class="spin" [size]="16" /> {{ 'auth.sending' | t }} }
            @else { {{ 'auth.sendReset' | t }} }
          </button>
        </form>
      }
      <p class="auth-switch"><a routerLink="/sign-in">{{ 'auth.backToSignIn' | t }}</a></p>
    </app-auth-card>
  `,
})
export default class ForgotPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);

  protected readonly busy = signal(false);
  protected readonly errorCode = signal<string | null>(null);
  protected readonly sentTo = signal<string | null>(null);
  private readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  protected showError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.errorCode.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    const email = normaliseEmail(this.form.controls.email.value);
    try {
      await this.auth.forgotPassword(email);
      this.sentTo.set(email);
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
    } finally {
      this.busy.set(false);
    }
  }
}

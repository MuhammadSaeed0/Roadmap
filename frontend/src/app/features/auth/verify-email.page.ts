import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountStatus, AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey } from './auth-ui';

/**
 * Opened from the verification email (/verify-email?token=…). The token is only sent to the API when the
 * person clicks "Confirm", so mail scanners that open (or even render) the link don't use it up.
 */
@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, AuthCardComponent],
  template: `
    <app-auth-card [heading]="'verify.title' | t">
      @switch (state()) {
        @case ('ready') {
          <p class="auth-subtitle">{{ 'verify.ready' | t }}</p>
          <button type="button" class="btn btn-primary btn-block" (click)="confirm()">
            <app-icon name="check-circle" [size]="16" /> {{ 'verify.confirm' | t }}
          </button>
        }
        @case ('checking') {
          <p class="auth-subtitle" role="status"><app-icon name="refresh" class="spin" [size]="16" /> {{ 'verify.checking' | t }}</p>
        }
        @case ('done') {
          <div class="callout callout-success" role="status">
            <app-icon name="check-circle" />
            <p>{{ (status() === 'Approved' ? 'verify.successApproved' : 'verify.success') | t }}</p>
          </div>
          @if (auth.account()) {
            <a [routerLink]="status() === 'Approved' ? '/' : '/account-status'" class="btn btn-primary btn-block">{{ 'verify.continue' | t }}</a>
          } @else {
            <a routerLink="/sign-in" class="btn btn-primary btn-block">{{ 'auth.signIn' | t }}</a>
          }
        }
        @case ('failed') {
          <div class="callout callout-danger" role="alert">
            <app-icon name="alert" />
            <div>
              <p>{{ 'verify.errors.' + errorCode() | t }}</p>
              <p class="small">{{ 'verify.newLinkHint' | t }}</p>
            </div>
          </div>
          <a [routerLink]="auth.account() ? '/account-status' : '/sign-in'" class="btn btn-primary btn-block">
            {{ (auth.account() ? 'verify.toStatus' : 'auth.signIn') | t }}
          </a>
        }
      }
    </app-auth-card>
  `,
})
export default class VerifyEmailPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  protected readonly state = signal<'ready' | 'checking' | 'done' | 'failed'>('ready');
  protected readonly status = signal<AccountStatus | null>(null);
  protected readonly errorCode = signal('generic');

  async ngOnInit(): Promise<void> {
    await this.auth.restore();
    if (!this.token) this.fail('invalid_token');
  }

  protected async confirm(): Promise<void> {
    this.state.set('checking');
    try {
      this.status.set(await this.auth.verifyEmail(this.token));
      this.state.set('done');
    } catch (e) {
      this.fail(authErrorKey(this.i18n, e));
    }
  }

  private fail(code: string): void {
    this.errorCode.set(this.i18n.has(`verify.errors.${code}`) ? code : 'generic');
    this.state.set('failed');
  }
}

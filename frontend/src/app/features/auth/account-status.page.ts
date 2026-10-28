import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent, authErrorKey } from './auth-ui';

/**
 * Where a signed-in account waits: confirm the email, then an administrator's approval.
 * Rejected and suspended accounts see why (with the administrator's note, if any).
 * The API enforces all of this; the page only explains it.
 */
@Component({
  selector: 'app-account-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, AuthCardComponent],
  template: `
    @if (auth.account(); as account) {
      <app-auth-card [heading]="'status.' + account.status + '.title' | t">
        <div class="status-steps" role="list" [attr.aria-label]="'status.steps' | t">
          <div role="listitem" class="status-step" [attr.data-state]="emailStep()">
            <app-icon [name]="emailStep() === 'done' ? 'check-circle' : 'mail'" [size]="18" />
            <span>{{ 'status.stepEmail' | t }}</span>
          </div>
          <div role="listitem" class="status-step" [attr.data-state]="approvalStep()">
            <app-icon [name]="approvalStep() === 'blocked' ? 'alert' : approvalStep() === 'done' ? 'check-circle' : 'shield'" [size]="18" />
            <span>{{ 'status.stepApproval' | t }}</span>
          </div>
        </div>

        <div class="callout" [class.callout-danger]="blocked()" [class.callout-info]="!blocked()" role="status">
          <app-icon [name]="blocked() ? 'alert' : 'info'" />
          <div>
            <p>{{ 'status.' + account.status + '.body' | t: { email: account.email } }}</p>
            @if (blocked() && account.statusReason) {
              <p><strong>{{ 'status.reason' | t }}:</strong> {{ account.statusReason }}</p>
            }
          </div>
        </div>

        @if (errorCode(); as code) {
          <div class="callout callout-danger" role="alert"><app-icon name="alert" /><p>{{ 'auth.errors.' + code | t }}</p></div>
        }

        <div class="stack">
          @if (account.status === 'PendingEmailVerification') {
            <button type="button" class="btn btn-primary btn-block" (click)="resend()" [disabled]="busy()">
              <app-icon name="mail" [size]="16" /> {{ (busy() ? 'auth.sending' : 'status.resend') | t }}
            </button>
          }
          <button type="button" class="btn btn-secondary btn-block" (click)="check()" [disabled]="checking()">
            <app-icon name="refresh" [size]="16" [class.spin]="checking()" /> {{ 'status.refresh' | t }}
          </button>
          <button type="button" class="btn btn-ghost btn-block" (click)="signOut()">
            <app-icon name="log-out" [size]="16" /> {{ 'auth.signOut' | t }}
          </button>
        </div>
      </app-auth-card>
    }
  `,
})
export default class AccountStatusPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly busy = signal(false);
  protected readonly checking = signal(false);
  protected readonly errorCode = signal<string | null>(null);

  protected readonly blocked = computed(() => ['Rejected', 'Suspended'].includes(this.auth.account()?.status ?? ''));
  protected readonly emailStep = computed(() => this.auth.account()?.status === 'PendingEmailVerification' ? 'current' : 'done');
  protected readonly approvalStep = computed(() => {
    const status = this.auth.account()?.status;
    if (status === 'PendingApproval') return 'current';
    if (status === 'Rejected' || status === 'Suspended') return 'blocked';
    return status === 'Approved' ? 'done' : 'todo';
  });

  protected async resend(): Promise<void> {
    this.errorCode.set(null);
    this.busy.set(true);
    try {
      await this.auth.resendVerification();
      this.toast.success(this.i18n.t('status.resent', { email: this.auth.account()?.email ?? '' }));
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
    } finally {
      this.busy.set(false);
    }
  }

  /** Re-reads the status; once approved, the app opens. */
  protected async check(): Promise<void> {
    this.errorCode.set(null);
    this.checking.set(true);
    try {
      const account = await this.auth.refresh();
      if (!account) { await this.router.navigateByUrl('/sign-in'); return; }
      if (account.status === 'Approved') {
        this.toast.success(this.i18n.t('status.nowApproved'));
        await this.router.navigateByUrl('/');
      } else {
        this.toast.info(this.i18n.t('status.unchanged'));
      }
    } catch (e) {
      this.errorCode.set(authErrorKey(this.i18n, e));
    } finally {
      this.checking.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut().catch(() => undefined);
    await this.router.navigateByUrl('/sign-in');
  }
}

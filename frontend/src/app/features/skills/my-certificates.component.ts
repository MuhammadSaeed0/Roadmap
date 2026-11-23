import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { MyCertificate } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { linkedInAddUrl, linkedInTitle, verifyUrl } from '../certificate/certificate-links';

/**
 * The Certificates tab of the Developer Level page: every finished phase with its certificate (open, copy the
 * verify link, add to LinkedIn), or a button to get it when it hasn't been issued yet.
 */
@Component({
  selector: 'app-my-certificates',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe, EmptyStateComponent, ErrorStateComponent, SkeletonComponent],
  styles: `
    :host { display: block; }
    .cert-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .cert-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); }
    .cert-num {
      display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 50%;
      background: var(--success-soft); color: var(--success); font-weight: 600;
    }
    .cert-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
    .cert-title { font-weight: 600; overflow-wrap: anywhere; }
    .cert-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
    @media (max-width: 600px) {
      .cert-row { flex-wrap: wrap; }
      .cert-info { flex-basis: calc(100% - 54px); }
      .cert-actions { width: 100%; justify-content: flex-start; }
    }
  `,
  template: `
    <section class="card" aria-labelledby="certs-h" data-tour="skills-certificates">
      <h2 id="certs-h" class="card-title"><app-icon name="award" /> {{ 'myCertificates.title' | t }}</h2>
      <p class="muted small">{{ 'myCertificates.intro' | t }}</p>

      @if (list.initialLoading()) {
        <app-skeleton [rows]="3" />
      } @else if (list.error()) {
        <app-error-state [error]="list.error()" (retry)="list.reload()" />
      } @else if ((list.value() ?? []).length === 0) {
        <app-empty-state icon="award" [title]="'myCertificates.empty' | t" [message]="'myCertificates.emptyHint' | t">
          <a routerLink="/roadmap" class="btn btn-secondary btn-sm">{{ 'nav.roadmap' | t }}</a>
        </app-empty-state>
      } @else {
        <ul class="cert-list" role="list">
          @for (c of list.value(); track c.phaseId) {
            <li class="cert-row">
              <span class="cert-num" aria-hidden="true">{{ c.phaseOrder }}</span>
              <span class="cert-info">
                <span class="tiny muted">{{ 'roadmap.phase' | t: { n: c.phaseOrder } }}</span>
                <span class="cert-title">{{ i18n.pick(c.phaseTitleEn, c.phaseTitleAr) }}</span>
                <span class="tiny muted">
                  @if (c.issuedAt) { {{ 'myCertificates.issuedOn' | t: { date: (c.issuedAt | fmtDate) } }} · <bdi dir="ltr">{{ c.code }}</bdi> }
                  @else { {{ 'myCertificates.notIssued' | t }} }
                </span>
              </span>
              <span class="cert-actions">
                @if (c.code) {
                  <a class="btn btn-primary btn-sm" [routerLink]="['/c', c.code]"><app-icon name="award" [size]="15" /> {{ 'myCertificates.open' | t }}</a>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="copy(c.code)"><app-icon name="copy" [size]="15" /> {{ 'certificate.copyLink' | t }}</button>
                  <a class="btn btn-secondary btn-sm" [href]="linkedIn(c)" target="_blank" rel="noopener noreferrer">
                    <app-icon name="external" [size]="15" /> {{ 'certificate.linkedIn' | t }}
                  </a>
                } @else {
                  <button type="button" class="btn btn-primary btn-sm" (click)="issue(c)" [disabled]="busy() === c.phaseId">
                    <app-icon name="award" [size]="15" /> {{ 'roadmap.getCertificate' | t }}
                  </button>
                }
              </span>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class MyCertificatesComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly origin = inject(DOCUMENT).location.origin;
  protected readonly i18n = inject(I18nService);

  protected readonly list = createLoader(() => this.api.myCertificates());
  protected readonly busy = signal<number | null>(null);

  protected linkedIn(c: MyCertificate): string {
    return c.code && c.issuedAt
      ? linkedInAddUrl({ code: c.code, issuedAt: c.issuedAt }, linkedInTitle(c.phaseOrder, c.phaseTitleEn), verifyUrl(this.origin, c.code))
      : '';
  }

  protected async copy(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(verifyUrl(this.origin, code));
      this.toast.success(this.i18n.t('certificate.copied'));
    } catch {
      this.toast.error(this.i18n.t('certificate.copyFailed'));
    }
  }

  /** Issues the certificate of a finished phase and opens it. */
  protected async issue(c: MyCertificate): Promise<void> {
    this.busy.set(c.phaseId);
    try {
      const certificate = await this.api.issueCertificate(c.phaseId);
      await this.router.navigate(['/c', certificate.code]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}

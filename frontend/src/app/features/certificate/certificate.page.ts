import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { linkedInAddUrl, linkedInTitle } from './certificate-links';

/**
 * A phase certificate at /c/{code}: readable by anyone with the link, signed in or not. "Download PDF" opens the
 * browser's print dialog; the print stylesheet lays the certificate out alone on an A4 landscape page.
 * The wording describes completed self-paced progress and makes no claim of accreditation.
 */
@Component({
  selector: 'app-certificate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe, EmptyStateComponent, SkeletonComponent],
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; width: min(980px, 100%); margin-inline: auto; }
    .certificate {
      position: relative; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
      padding: clamp(24px, 6vw, 56px) clamp(18px, 5vw, 64px); border-radius: var(--radius);
      background: var(--surface); color: var(--text);
      border: 1px solid var(--border); box-shadow: var(--shadow);
      outline: 2px solid var(--accent-soft); outline-offset: -12px;
    }
    .cert-brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: 0.02em; color: var(--accent-text); }
    .cert-kicker { margin: 0; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
    .cert-presented { margin: 0; color: var(--text-2); }
    .cert-name { margin: 0; font-size: clamp(1.6rem, 5vw, 2.6rem); line-height: 1.2; overflow-wrap: anywhere; }
    .cert-body { margin: 0; max-width: 60ch; font-size: 1.05rem; line-height: 1.6; color: var(--text-2); }
    .cert-phase { margin: 0; font-size: clamp(1.15rem, 3.4vw, 1.5rem); font-weight: 600; overflow-wrap: anywhere; }
    .cert-seal {
      display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%;
      background: var(--success-soft); color: var(--success);
    }
    .cert-meta {
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; width: 100%; margin-top: 8px;
      padding-top: 16px; border-top: 1px solid var(--border);
    }
    .cert-meta div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .cert-meta strong { font-size: 0.95rem; overflow-wrap: anywhere; }
    .cert-note { margin: 0; max-width: 70ch; font-size: 0.78rem; color: var(--muted); }
    .cert-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    @media (max-width: 560px) {
      .cert-meta { grid-template-columns: 1fr; }
      .cert-actions .btn { flex: 1 1 100%; justify-content: center; }
    }
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
      :host { width: 100%; }
      .cert-actions, .cert-verified { display: none !important; }
      .certificate {
        box-shadow: none; border: 2px solid #2b2b2b; outline: 1px solid #2b2b2b; outline-offset: -10px;
        height: 186mm; box-sizing: border-box; justify-content: center; break-inside: avoid; overflow: hidden;
        background: #fff; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .cert-body, .cert-presented { color: #333; }
    }
  `,
  template: `
    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="8" /></div>
    } @else if (data.error() || !data.value()) {
      <app-empty-state icon="award" [title]="'certificate.notFound' | t" [message]="'certificate.notFoundHint' | t">
        <a routerLink="/" class="btn btn-secondary btn-sm">{{ 'app.name' | t }}</a>
      </app-empty-state>
    } @else if (data.value(); as c) {
      <p class="callout small cert-verified" role="status"><app-icon name="check" [size]="15" /> {{ 'certificate.verified' | t }}</p>

      <article class="certificate" [attr.aria-label]="'certificate.title' | t">
        <span class="cert-brand"><app-icon name="award" [size]="18" /> {{ 'app.name' | t }}</span>
        <p class="cert-kicker">{{ 'certificate.kicker' | t }}</p>
        <p class="cert-presented">{{ 'certificate.presentedTo' | t }}</p>
        <h1 class="cert-name" dir="auto">{{ c.name }}</h1>
        <p class="cert-body">
          @if (c.trackTitleEn) { {{ 'certificate.bodyTrack' | t: { n: c.phaseOrder, track: i18n.pick(c.trackTitleEn, c.trackTitleAr) } }} }
          @else { {{ 'certificate.body' | t: { n: c.phaseOrder } }} }
        </p>
        <p class="cert-phase">{{ phaseTitle() }}</p>
        <span class="cert-seal" aria-hidden="true"><app-icon name="award" [size]="28" /></span>
        <div class="cert-meta">
          <div><span class="tiny muted">{{ 'certificate.issued' | t }}</span><strong>{{ c.issuedAt | fmtDate: 'long' }}</strong></div>
          <div><span class="tiny muted">{{ 'certificate.topics' | t }}</span><strong>{{ c.topicCount }}</strong></div>
          <div><span class="tiny muted">{{ 'certificate.code' | t }}</span><strong dir="ltr">{{ c.code }}</strong></div>
        </div>
        <p class="cert-note">{{ 'certificate.verifyAt' | t }} <bdi dir="ltr">{{ verifyUrl() }}</bdi></p>
        <p class="cert-note">{{ 'certificate.disclaimer' | t }}</p>
      </article>

      <div class="cert-actions">
        <button type="button" class="btn btn-primary" (click)="print()"><app-icon name="download" [size]="16" /> {{ 'certificate.download' | t }}</button>
        <button type="button" class="btn btn-secondary" (click)="copyLink()"><app-icon name="copy" [size]="16" /> {{ 'certificate.copyLink' | t }}</button>
        <a class="btn btn-secondary" [href]="linkedIn()" target="_blank" rel="noopener noreferrer">
          <app-icon name="external" [size]="16" /> {{ 'certificate.linkedIn' | t }}
        </a>
      </div>
    }
  `,
})
export default class CertificatePage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  protected readonly i18n = inject(I18nService);

  private readonly code = this.route.snapshot.paramMap.get('code') ?? '';
  protected readonly data = createLoader(() => this.api.certificate(this.code));

  protected readonly phaseTitle = computed(() => {
    const c = this.data.value();
    return c ? this.i18n.pick(c.phaseTitleEn, c.phaseTitleAr) : '';
  });
  protected readonly verifyUrl = computed(() => `${this.document.location.origin}/c/${this.data.value()?.code ?? this.code}`);
  protected readonly linkedIn = computed(() => {
    const c = this.data.value();
    return c ? linkedInAddUrl(c, linkedInTitle(c.phaseOrder, c.phaseTitleEn, c.trackTitleEn), this.verifyUrl()) : '';
  });

  protected print(): void {
    this.document.defaultView?.print();
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.verifyUrl());
      this.toast.success(this.i18n.t('certificate.copied'));
    } catch {
      this.toast.error(this.i18n.t('certificate.copyFailed'));
    }
  }
}

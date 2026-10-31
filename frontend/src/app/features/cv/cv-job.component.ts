import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { CvAiResult, CvApiService, CvJobMatch } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';
import { useCvErrors } from './cv-strings';

/**
 * Compares the CV with a job description (keywords, no AI), optionally asks the assistant how to tailor it,
 * and saves a tailored copy. The CV being edited is never overwritten by tailoring.
 */
@Component({
  selector: 'app-cv-job',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <p class="muted small">{{ 'cv.job.intro' | t }}</p>
    <div class="field">
      <label for="job-desc">{{ 'cv.job.paste' | t }}</label>
      <textarea id="job-desc" class="input" rows="7" maxlength="20000" [value]="state.jobDescription()" (input)="state.jobDescription.set(val($event))"
                [placeholder]="'cv.job.placeholder' | t"></textarea>
    </div>
    <div class="cv-row">
      <button type="button" class="btn btn-primary btn-sm" (click)="analyse()" [disabled]="busy() || !state.jobDescription().trim()">
        <app-icon name="target" [size]="14" /> {{ 'cv.job.analyse' | t }}</button>
      @if (aiEnabled()) {
        <button type="button" class="btn btn-secondary btn-sm" (click)="tailorWithAi()" [disabled]="busy() || !state.jobDescription().trim()">
          <app-icon name="sparkle" [size]="14" /> {{ 'cv.job.aiTailor' | t }}</button>
      }
    </div>
    @if (busy()) { <p class="small muted" role="status">{{ 'cv.ai.working' | t }}</p> }
    @if (error()) { <p class="callout callout-danger small" role="alert">{{ error() }}</p> }

    @if (match(); as m) {
      @if (m.jobKeywords.length === 0) {
        <p class="callout small">{{ 'cv.job.none' | t }}</p>
      } @else {
        <section class="cv-kw">
          <h3>{{ 'cv.job.matched' | t }} ({{ m.matched.length }}/{{ m.jobKeywords.length }})</h3>
          <div class="chips">@for (k of m.matched; track k) { <span class="chip chip-sm cv-ok"><app-icon name="check" [size]="12" /> {{ k }}</span> }</div>
        </section>
        @if (m.missingButLearning.length) {
          <section class="cv-kw">
            <h3>{{ 'cv.job.learning' | t }}</h3>
            <div class="chips">@for (k of m.missingButLearning; track k) { <span class="chip chip-sm">{{ k }}</span> }</div>
          </section>
        }
        @if (m.missing.length) {
          <section class="cv-kw">
            <h3>{{ 'cv.job.missing' | t }}</h3>
            <div class="chips">@for (k of m.missing; track k) { <span class="chip chip-sm chip-warn">{{ k }}</span> }</div>
          </section>
        }
        @if (m.projectsToHighlight.length) {
          <section class="cv-kw">
            <h3>{{ 'cv.job.highlight' | t }}</h3>
            <ul class="small">@for (p of m.projectsToHighlight; track p) { <li>{{ p }}</li> }</ul>
          </section>
        }
        <section class="cv-kw">
          <h3>{{ 'cv.job.order' | t }}</h3>
          <p class="small">{{ orderText() }}</p>
          <button type="button" class="btn btn-xs btn-secondary" (click)="applyOrder(m)">{{ 'cv.job.applyOrder' | t }}</button>
        </section>
      }
    }

    @if (ai(); as r) {
      <section class="card cv-ai-box" aria-live="polite">
        <h3><app-icon name="sparkle" [size]="15" /> {{ 'cv.job.aiTitle' | t }}</h3>
        @if (r.text) { <p class="cv-pre">{{ r.text }}</p> }
        @if (r.suggestions.length) {
          <ul class="small">@for (s of r.suggestions; track $index) { <li><span class="chip chip-sm">{{ s.section }}</span> {{ s.suggestion }}</li> }</ul>
        }
        @if (r.notes.length) { <ul class="small muted">@for (n of r.notes; track $index) { <li>{{ n }}</li> }</ul> }
        <p class="small muted">{{ 'cv.ai.disclaimer' | t }}</p>
      </section>
    }

    @if (match() || ai()) {
      <section class="card cv-copy">
        <h3>{{ 'cv.job.copyTitle' | t }}</h3>
        <p class="small muted">{{ 'cv.job.copyHint' | t }}</p>
        <div class="field">
          <label for="job-name">{{ 'cv.job.copyName' | t }}</label>
          <input id="job-name" class="input" maxlength="150" [value]="jobName()" (input)="jobName.set(val($event))" placeholder="Acme – Junior .NET Developer" />
        </div>
        <button type="button" class="btn btn-primary btn-sm" (click)="createCopy()" [disabled]="busy() || !jobName().trim()">
          <app-icon name="copy" [size]="14" /> {{ 'cv.job.createCopy' | t }}</button>
      </section>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 12px; }
    .cv-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .cv-kw h3, .cv-copy h3 { font-size: .9rem; margin: 0 0 6px; }
    .cv-kw ul { margin: 0; padding-inline-start: 18px; }
    .cv-ok { background: var(--success-soft); color: var(--success); }
    .cv-ai-box, .cv-copy { display: flex; flex-direction: column; gap: 8px; padding: 14px; }
    .cv-ai-box { border-color: var(--accent); }
    .cv-ai-box h3 { display: flex; gap: 6px; align-items: center; font-size: .95rem; margin: 0; color: var(--accent-text); }
    .cv-ai-box ul { margin: 0; padding-inline-start: 18px; }
    .cv-pre { white-space: pre-wrap; margin: 0; }
  `,
})
export class CvJobComponent {
  private readonly api = inject(CvApiService);
  protected readonly state = inject(CvEditorState);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly errorText = useCvErrors();

  private readonly status = createLoader(() => this.api.aiStatus());
  protected readonly aiEnabled = computed(() => !!this.status.value()?.enabled);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly match = signal<CvJobMatch | null>(null);
  protected readonly ai = signal<CvAiResult | null>(null);
  protected readonly jobName = signal('');
  protected readonly orderText = computed(() =>
    (this.match()?.suggestedOrder ?? []).map(k => this.i18n.t('cv.sectionNames.' + k)).join(' → '));

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }

  protected async analyse(): Promise<void> {
    await this.busyWhile(async () => {
      if (!(await this.state.flush())) throw new Error(this.state.saveError());
      this.match.set(await this.api.jobMatch(this.state.id(), this.state.jobDescription()));
    });
  }

  protected async tailorWithAi(): Promise<void> {
    await this.busyWhile(async () => {
      if (!(await this.state.flush())) throw new Error(this.state.saveError());
      this.ai.set(await this.api.ai(this.state.id(), {
        action: 'tailor', jobDescription: this.state.jobDescription(), targetRole: this.state.content()?.personal.title || null,
      }));
    });
  }

  protected applyOrder(m: CvJobMatch): void {
    this.state.setStyle({ sectionOrder: [...m.suggestedOrder] });
    this.toast.success(this.i18n.t('cv.job.orderApplied'));
  }

  /** A copy for this job, with the suggested order and AI summary applied to the copy only. */
  protected async createCopy(): Promise<void> {
    await this.busyWhile(async () => {
      if (!(await this.state.flush())) throw new Error(this.state.saveError());
      const copy = await this.api.duplicate(this.state.id(), { tailoredFor: this.jobName().trim() });
      const order = this.match()?.suggestedOrder;
      const summary = this.ai()?.text;
      if (order || summary) {
        await this.api.update(copy.summary.id, {
          title: copy.summary.title, templateKey: copy.summary.templateKey,
          content: summary ? { ...copy.content, summary } : copy.content,
          style: order ? { ...copy.style, sectionOrder: [...order] } : copy.style,
        });
      }
      this.toast.success(this.i18n.t('cv.job.copyCreated'));
      await this.router.navigate(['/cv', copy.summary.id]);
    });
  }

  private async busyWhile(work: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await work();
    } catch (e) {
      this.error.set(e instanceof Error && !(e as { code?: string }).code && e.message ? e.message : this.errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
}

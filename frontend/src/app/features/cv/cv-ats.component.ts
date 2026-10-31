import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { ProgressRingComponent } from '../../shared/ui.components';
import { CvApiService, CvAtsIssue, CvAtsReport } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';
import { useCvErrors } from './cv-strings';

const SEVERITY_ICONS = { error: 'alert', warning: 'info', info: 'bulb' } as const;

/** Rule-based ATS-readiness check of what is on screen (saved or not). */
@Component({
  selector: 'app-cv-ats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, ProgressRingComponent],
  template: `
    <p class="muted small">{{ 'cv.ats.intro' | t }}</p>
    @if (state.jobDescription().trim()) {
      <label class="check-label"><input type="checkbox" [checked]="withJob()" (change)="withJob.set(checked($event))" /> {{ 'cv.ats.withJob' | t }}</label>
    }
    <div><button type="button" class="btn btn-primary btn-sm" (click)="run()" [disabled]="busy()"><app-icon name="check-circle" [size]="14" /> {{ 'cv.ats.run' | t }}</button></div>
    @if (error()) { <p class="callout callout-danger small" role="alert">{{ error() }}</p> }

    @if (report(); as r) {
      <div class="cv-score" aria-live="polite">
        <app-progress-ring [value]="r.score" [size]="96" [stroke]="9" [label]="'cv.ats.score' | t" />
        <p class="small muted">{{ 'cv.ats.disclaimer' | t }}</p>
      </div>
      <section>
        <h3 class="cv-h">{{ 'cv.ats.issues' | t }}</h3>
        @if (r.issues.length === 0) { <p class="small">{{ 'cv.ats.noIssues' | t }}</p> }
        <ul class="cv-issues" role="list">
          @for (i of r.issues; track $index) {
            <li [attr.data-severity]="i.severity">
              <app-icon [name]="icons[i.severity]" [size]="15" />
              <div class="grow">
                <span class="cv-sev">{{ 'cv.ats.severity.' + i.severity | t }}</span>
                <span>{{ i | loc: 'message' }}</span>
              </div>
              @if (stepFor(i); as step) {
                <button type="button" class="btn btn-xs btn-ghost" (click)="goTo.emit(step)">{{ 'cv.ats.goTo' | t: { section: ('cv.steps.' + step | t) } }}</button>
              } @else if (i.section === 'design') {
                <button type="button" class="btn btn-xs btn-ghost" (click)="goTo.emit('design')">{{ 'cv.ats.goTo' | t: { section: ('cv.editor.panels.design' | t) } }}</button>
              }
            </li>
          }
        </ul>
      </section>
      @if (r.matchedKeywords.length || r.missingKeywords.length) {
        <section>
          <h3 class="cv-h">{{ 'cv.ats.keywords' | t }}</h3>
          <div class="chips">
            @for (k of r.matchedKeywords; track k) { <span class="chip chip-sm cv-ok"><app-icon name="check" [size]="12" /> {{ k }}</span> }
            @for (k of r.missingKeywords; track k) { <span class="chip chip-sm chip-warn">{{ k }}</span> }
          </div>
        </section>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 12px; }
    .cv-score { display: flex; gap: 14px; align-items: center; }
    .cv-h { font-size: .9rem; margin: 0 0 6px; }
    .cv-issues { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .cv-issues li { display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border-radius: var(--radius-xs); background: var(--surface-2); border-inline-start: 3px solid var(--border-strong); }
    .cv-issues li[data-severity='error'] { border-color: var(--danger); background: var(--danger-soft); }
    .cv-issues li[data-severity='warning'] { border-color: var(--warning); background: var(--warning-soft); }
    .cv-issues li[data-severity='info'] { border-color: var(--info); }
    .cv-sev { font-weight: 600; font-size: .78rem; margin-inline-end: 6px; }
    .cv-ok { background: var(--success-soft); color: var(--success); }
  `,
})
export class CvAtsComponent {
  private readonly api = inject(CvApiService);
  protected readonly state = inject(CvEditorState);
  private readonly errorText = useCvErrors();

  /** Opens the editor step (or the design panel) an issue is about. */
  readonly goTo = output<string>();
  protected readonly icons = SEVERITY_ICONS;
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly withJob = signal(true);
  protected readonly report = signal<CvAtsReport | null>(null);

  protected checked(e: Event): boolean { return (e.target as HTMLInputElement).checked; }

  protected stepFor(issue: CvAtsIssue): string | null {
    return ['personal', 'summary', 'experience', 'projects', 'skills', 'education'].includes(issue.section) ? issue.section : null;
  }

  protected async run(): Promise<void> {
    const content = this.state.content(), style = this.state.style();
    if (!content || !style) return;
    this.busy.set(true);
    this.error.set('');
    try {
      this.report.set(await this.api.atsCheck({
        templateKey: this.state.templateKey(), content, style,
        jobDescription: this.withJob() && this.state.jobDescription().trim() ? this.state.jobDescription() : null,
      }));
    } catch (e) {
      this.error.set(this.errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
}

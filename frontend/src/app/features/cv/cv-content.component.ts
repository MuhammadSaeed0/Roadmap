import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { CvApiService, CvContent, CvPersonal, blank } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';
import { useCvErrors } from './cv-strings';

export const CONTENT_STEPS = ['personal', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'languages', 'more'] as const;
export type ContentStep = (typeof CONTENT_STEPS)[number];
type ListKey = 'education' | 'experience' | 'skills' | 'projects' | 'certifications' | 'languages' | 'sections';
const SECTION_KINDS = ['achievements', 'volunteer', 'publications', 'coursework', 'opensource', 'interests', 'custom'];

/** The CV's sections, one step at a time. Every keystroke goes to the editor state (autosaved, previewed). */
@Component({
  selector: 'app-cv-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <nav class="cv-steps" [attr.aria-label]="'cv.editor.panels.content' | t">
      @for (s of steps; track s; let i = $index) {
        <button type="button" class="cv-step" [class.active]="step() === s" [attr.aria-current]="step() === s ? 'step' : null" (click)="step.set(s)">
          <span class="cv-step-num">{{ i + 1 }}</span> {{ 'cv.steps.' + s | t }}
        </button>
      }
    </nav>

    @if (state.content(); as c) {
      <div class="cv-step-body">
        @switch (step()) {
          @case ('personal') {
            <div class="cv-grid">
              @for (f of personalFields; track f.key) {
                <div class="field" [class.cv-span]="f.wide">
                  <label [for]="'p-' + f.key">{{ 'cv.fields.' + f.key | t }}</label>
                  <input class="input" [id]="'p-' + f.key" [type]="f.type" [attr.dir]="f.type === 'text' ? null : 'ltr'" [attr.autocomplete]="f.auto"
                         [value]="c.personal[f.key]" (input)="setPersonal(f.key, val($event))" maxlength="300" />
                </div>
              }
            </div>
            <div class="cv-photo">
              <span class="cv-label">{{ 'cv.photo.label' | t }}</span>
              <div class="cv-photo-row">
                @if (state.summary()?.hasPhoto) {
                  <img [src]="api.photoUrl(state.id(), state.summary()!.updatedAt)" alt="" width="64" height="64" class="cv-photo-img" />
                }
                <label class="btn btn-sm btn-secondary">
                  <app-icon name="upload" [size]="14" /> {{ (state.summary()?.hasPhoto ? 'cv.photo.change' : 'cv.photo.upload') | t }}
                  <input type="file" accept="image/jpeg,image/png" class="visually-hidden" (change)="uploadPhoto($event)" />
                </label>
                @if (state.summary()?.hasPhoto) {
                  <button type="button" class="btn btn-sm btn-ghost" (click)="removePhoto()">{{ 'cv.photo.remove' | t }}</button>
                }
              </div>
              <small class="muted small">{{ 'cv.photo.help' | t }}</small>
              @if (state.template() && !state.template()!.supportsPhoto) { <small class="muted small">{{ 'cv.photo.notInTemplate' | t }}</small> }
            </div>
          }

          @case ('summary') {
            <div class="field">
              <label for="cv-summary">{{ 'cv.fields.summary' | t }}</label>
              <textarea id="cv-summary" class="input" rows="6" maxlength="2000" [value]="c.summary" (input)="edit(x => ({ ...x, summary: val($event) }))"
                        aria-describedby="cv-summary-hint"></textarea>
              <small id="cv-summary-hint" class="muted small">{{ 'cv.fields.summaryHint' | t }} · {{ c.summary.length }}/2000</small>
            </div>
          }

          @case ('experience') {
            <p class="callout callout-info small"><app-icon name="info" [size]="15" /> {{ 'cv.hints.noExperience' | t }}</p>
            @for (x of c.experience; track $index; let i = $index) {
              <fieldset class="cv-entry">
                <legend>{{ x.title || x.company || ('cv.steps.experience' | t) }}</legend>
                <div class="cv-grid">
                  <div class="field"><label [for]="'x-t' + i">{{ 'cv.fields.jobTitle' | t }}</label>
                    <input class="input" [id]="'x-t' + i" [value]="x.title" (input)="setItem('experience', i, { title: val($event) })" maxlength="120" /></div>
                  <div class="field"><label [for]="'x-c' + i">{{ 'cv.fields.company' | t }}</label>
                    <input class="input" [id]="'x-c' + i" [value]="x.company" (input)="setItem('experience', i, { company: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'x-y' + i">{{ 'cv.fields.employmentType' | t }}</label>
                    <input class="input" [id]="'x-y' + i" [value]="x.employmentType" (input)="setItem('experience', i, { employmentType: val($event) })" maxlength="40" /></div>
                  <div class="field"><label [for]="'x-l' + i">{{ 'cv.fields.workLocation' | t }}</label>
                    <input class="input" [id]="'x-l' + i" [value]="x.location" (input)="setItem('experience', i, { location: val($event) })" maxlength="120" /></div>
                  <div class="field"><label [for]="'x-s' + i">{{ 'cv.fields.start' | t }}</label>
                    <input class="input" [id]="'x-s' + i" [value]="x.start" (input)="setItem('experience', i, { start: val($event) })" maxlength="20" placeholder="Jul 2023" /></div>
                  <div class="field"><label [for]="'x-e' + i">{{ 'cv.fields.end' | t }}</label>
                    <input class="input" [id]="'x-e' + i" [value]="x.end" (input)="setItem('experience', i, { end: val($event) })" maxlength="20" [disabled]="x.current" placeholder="Sep 2024" /></div>
                </div>
                <label class="check-label"><input type="checkbox" [checked]="x.current" (change)="setItem('experience', i, { current: checked($event) })" /> {{ 'cv.fields.current' | t }}</label>
                <div class="field"><label [for]="'x-r' + i">{{ 'cv.fields.responsibilities' | t }}</label>
                  <textarea class="input" [id]="'x-r' + i" rows="4" [value]="lines(x.responsibilities)" (input)="setItem('experience', i, { responsibilities: fromLines($event) })" [attr.aria-describedby]="'x-rh' + i"></textarea>
                  <small class="muted small" [id]="'x-rh' + i">{{ 'cv.fields.onePerLine' | t }}</small></div>
                <div class="field"><label [for]="'x-a' + i">{{ 'cv.fields.achievements' | t }}</label>
                  <textarea class="input" [id]="'x-a' + i" rows="2" [value]="lines(x.achievements)" (input)="setItem('experience', i, { achievements: fromLines($event) })"></textarea></div>
                <div class="cv-entry-actions">
                  <button type="button" class="icon-btn" (click)="move('experience', i, -1)" [disabled]="i === 0" [attr.aria-label]="'cv.actions.moveUp' | t"><app-icon name="chevron-up" [size]="15" /></button>
                  <button type="button" class="icon-btn" (click)="move('experience', i, 1)" [disabled]="i === c.experience.length - 1" [attr.aria-label]="'cv.actions.moveDown' | t"><app-icon name="chevron-down" [size]="15" /></button>
                  <button type="button" class="btn btn-sm btn-danger-text" (click)="remove('experience', i)"><app-icon name="trash" [size]="14" /> {{ 'cv.actions.remove' | t }}</button>
                </div>
              </fieldset>
            }
            <button type="button" class="btn btn-secondary" (click)="add('experience', blank.experience())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addExperience' | t }}</button>
          }

          @case ('projects') {
            <p class="muted small">{{ 'cv.hints.projects' | t }}</p>
            @for (x of c.projects; track $index; let i = $index) {
              <fieldset class="cv-entry">
                <legend>{{ x.name || ('cv.steps.projects' | t) }}</legend>
                <div class="cv-grid">
                  <div class="field"><label [for]="'pr-n' + i">{{ 'cv.fields.projectName' | t }}</label>
                    <input class="input" [id]="'pr-n' + i" [value]="x.name" (input)="setItem('projects', i, { name: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'pr-d' + i">{{ 'cv.fields.date' | t }}</label>
                    <input class="input" [id]="'pr-d' + i" [value]="x.date" (input)="setItem('projects', i, { date: val($event) })" maxlength="20" placeholder="2024" /></div>
                  <div class="field cv-span"><label [for]="'pr-t' + i">{{ 'cv.fields.technologies' | t }}</label>
                    <input class="input" [id]="'pr-t' + i" [value]="x.technologies.join(',')" (input)="setItem('projects', i, { technologies: fromCommas($event) })" [attr.aria-describedby]="'pr-th' + i" />
                    <small class="muted small" [id]="'pr-th' + i">{{ 'cv.fields.commaSeparated' | t }}</small></div>
                </div>
                <div class="field"><label [for]="'pr-desc' + i">{{ 'cv.fields.description' | t }}</label>
                  <textarea class="input" [id]="'pr-desc' + i" rows="3" maxlength="1200" [value]="x.description" (input)="setItem('projects', i, { description: val($event) })"></textarea></div>
                <div class="field"><label [for]="'pr-h' + i">{{ 'cv.fields.highlights' | t }}</label>
                  <textarea class="input" [id]="'pr-h' + i" rows="3" [value]="lines(x.highlights)" (input)="setItem('projects', i, { highlights: fromLines($event) })"></textarea>
                  <small class="muted small">{{ 'cv.fields.onePerLine' | t }}</small></div>
                <div class="cv-grid">
                  <div class="field"><label [for]="'pr-r' + i">{{ 'cv.fields.repoUrl' | t }}</label>
                    <input class="input" type="url" dir="ltr" [id]="'pr-r' + i" [value]="x.repoUrl" (input)="setItem('projects', i, { repoUrl: val($event) })" placeholder="https://github.com/…" /></div>
                  <div class="field"><label [for]="'pr-u' + i">{{ 'cv.fields.demoUrl' | t }}</label>
                    <input class="input" type="url" dir="ltr" [id]="'pr-u' + i" [value]="x.demoUrl" (input)="setItem('projects', i, { demoUrl: val($event) })" placeholder="https://…" /></div>
                </div>
                <div class="cv-entry-actions">
                  <button type="button" class="icon-btn" (click)="move('projects', i, -1)" [disabled]="i === 0" [attr.aria-label]="'cv.actions.moveUp' | t"><app-icon name="chevron-up" [size]="15" /></button>
                  <button type="button" class="icon-btn" (click)="move('projects', i, 1)" [disabled]="i === c.projects.length - 1" [attr.aria-label]="'cv.actions.moveDown' | t"><app-icon name="chevron-down" [size]="15" /></button>
                  <button type="button" class="btn btn-sm btn-danger-text" (click)="remove('projects', i)"><app-icon name="trash" [size]="14" /> {{ 'cv.actions.remove' | t }}</button>
                </div>
              </fieldset>
            }
            <button type="button" class="btn btn-secondary" (click)="add('projects', blank.project())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addProject' | t }}</button>
          }

          @case ('skills') {
            <p class="muted small">{{ 'cv.hints.skills' | t }}</p>
            @for (g of c.skills; track $index; let i = $index) {
              <div class="cv-entry cv-skill-row">
                <div class="field"><label [for]="'sk-c' + i">{{ 'cv.fields.category' | t }}</label>
                  <input class="input" [id]="'sk-c' + i" [value]="g.category" (input)="setItem('skills', i, { category: val($event) })" maxlength="60" [placeholder]="'cv.fields.categoryPlaceholder' | t" /></div>
                <div class="field grow"><label [for]="'sk-i' + i">{{ 'cv.fields.skills' | t }}</label>
                  <input class="input" [id]="'sk-i' + i" [value]="g.items.join(',')" (input)="setItem('skills', i, { items: fromCommas($event) })" placeholder="C#, ASP.NET Core, SQL Server" /></div>
                <button type="button" class="icon-btn cv-row-remove" (click)="remove('skills', i)" [attr.aria-label]="'cv.actions.remove' | t"><app-icon name="trash" [size]="15" /></button>
              </div>
            }
            <small class="muted small">{{ 'cv.fields.commaSeparated' | t }}</small>
            <div><button type="button" class="btn btn-secondary" (click)="add('skills', blank.skillGroup())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addGroup' | t }}</button></div>
          }

          @case ('education') {
            @for (x of c.education; track $index; let i = $index) {
              <fieldset class="cv-entry">
                <legend>{{ x.institution || ('cv.steps.education' | t) }}</legend>
                <div class="cv-grid">
                  <div class="field"><label [for]="'ed-i' + i">{{ 'cv.fields.institution' | t }}</label>
                    <input class="input" [id]="'ed-i' + i" [value]="x.institution" (input)="setItem('education', i, { institution: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'ed-d' + i">{{ 'cv.fields.degree' | t }}</label>
                    <input class="input" [id]="'ed-d' + i" [value]="x.degree" (input)="setItem('education', i, { degree: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'ed-f' + i">{{ 'cv.fields.field' | t }}</label>
                    <input class="input" [id]="'ed-f' + i" [value]="x.field" (input)="setItem('education', i, { field: val($event) })" maxlength="150" /></div>
                  <div class="field cv-dates">
                    <div><label [for]="'ed-s' + i">{{ 'cv.fields.start' | t }}</label>
                      <input class="input" [id]="'ed-s' + i" [value]="x.start" (input)="setItem('education', i, { start: val($event) })" maxlength="20" placeholder="2020" /></div>
                    <div><label [for]="'ed-e' + i">{{ 'cv.fields.end' | t }}</label>
                      <input class="input" [id]="'ed-e' + i" [value]="x.end" (input)="setItem('education', i, { end: val($event) })" maxlength="20" placeholder="2024" /></div>
                  </div>
                </div>
                <div class="field"><label [for]="'ed-a' + i">{{ 'cv.fields.highlights' | t }}</label>
                  <textarea class="input" [id]="'ed-a' + i" rows="2" [value]="lines(x.achievements)" (input)="setItem('education', i, { achievements: fromLines($event) })"></textarea>
                  <small class="muted small">{{ 'cv.fields.onePerLine' | t }}</small></div>
                <div class="cv-entry-actions">
                  <button type="button" class="icon-btn" (click)="move('education', i, -1)" [disabled]="i === 0" [attr.aria-label]="'cv.actions.moveUp' | t"><app-icon name="chevron-up" [size]="15" /></button>
                  <button type="button" class="icon-btn" (click)="move('education', i, 1)" [disabled]="i === c.education.length - 1" [attr.aria-label]="'cv.actions.moveDown' | t"><app-icon name="chevron-down" [size]="15" /></button>
                  <button type="button" class="btn btn-sm btn-danger-text" (click)="remove('education', i)"><app-icon name="trash" [size]="14" /> {{ 'cv.actions.remove' | t }}</button>
                </div>
              </fieldset>
            }
            <button type="button" class="btn btn-secondary" (click)="add('education', blank.education())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addEducation' | t }}</button>
          }

          @case ('certifications') {
            <p class="callout callout-warn small"><app-icon name="award" [size]="15" /> {{ 'cv.hints.certifications' | t }}</p>
            @for (x of c.certifications; track $index; let i = $index) {
              <fieldset class="cv-entry">
                <legend>{{ x.name || ('cv.steps.certifications' | t) }}</legend>
                <div class="cv-grid">
                  <div class="field"><label [for]="'ce-n' + i">{{ 'cv.fields.certName' | t }}</label>
                    <input class="input" [id]="'ce-n' + i" [value]="x.name" (input)="setItem('certifications', i, { name: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'ce-i' + i">{{ 'cv.fields.issuer' | t }}</label>
                    <input class="input" [id]="'ce-i' + i" [value]="x.issuer" (input)="setItem('certifications', i, { issuer: val($event) })" maxlength="150" /></div>
                  <div class="field"><label [for]="'ce-d' + i">{{ 'cv.fields.date' | t }}</label>
                    <input class="input" [id]="'ce-d' + i" [value]="x.date" (input)="setItem('certifications', i, { date: val($event) })" maxlength="20" /></div>
                  <div class="field"><label [for]="'ce-u' + i">{{ 'cv.fields.url' | t }}</label>
                    <input class="input" type="url" dir="ltr" [id]="'ce-u' + i" [value]="x.url" (input)="setItem('certifications', i, { url: val($event) })" /></div>
                </div>
                <div class="cv-entry-actions">
                  <button type="button" class="btn btn-sm btn-danger-text" (click)="remove('certifications', i)"><app-icon name="trash" [size]="14" /> {{ 'cv.actions.remove' | t }}</button>
                </div>
              </fieldset>
            }
            <button type="button" class="btn btn-secondary" (click)="add('certifications', blank.certification())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addCertification' | t }}</button>
          }

          @case ('languages') {
            @for (x of c.languages; track $index; let i = $index) {
              <div class="cv-entry cv-skill-row">
                <div class="field"><label [for]="'la-n' + i">{{ 'cv.fields.language' | t }}</label>
                  <input class="input" [id]="'la-n' + i" [value]="x.name" (input)="setItem('languages', i, { name: val($event) })" maxlength="60" /></div>
                <div class="field grow"><label [for]="'la-l' + i">{{ 'cv.fields.level' | t }}</label>
                  <input class="input" [id]="'la-l' + i" [value]="x.level" (input)="setItem('languages', i, { level: val($event) })" maxlength="60" [placeholder]="'cv.fields.levelPlaceholder' | t" /></div>
                <button type="button" class="icon-btn cv-row-remove" (click)="remove('languages', i)" [attr.aria-label]="'cv.actions.remove' | t"><app-icon name="trash" [size]="15" /></button>
              </div>
            }
            <div><button type="button" class="btn btn-secondary" (click)="add('languages', blank.language())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addLanguage' | t }}</button></div>
          }

          @case ('more') {
            @for (x of c.sections; track $index; let i = $index) {
              <fieldset class="cv-entry">
                <legend>{{ x.title || ('cv.sectionKinds.' + x.kind | t) }}</legend>
                <div class="cv-grid">
                  <div class="field"><label [for]="'se-k' + i">{{ 'cv.fields.sectionKind' | t }}</label>
                    <select class="input" [id]="'se-k' + i" [value]="x.kind" (change)="setItem('sections', i, { kind: val($event) })">
                      @for (k of kinds; track k) { <option [value]="k" [selected]="k === x.kind">{{ 'cv.sectionKinds.' + k | t }}</option> }
                    </select></div>
                  <div class="field"><label [for]="'se-t' + i">{{ 'cv.fields.sectionTitle' | t }}</label>
                    <input class="input" [id]="'se-t' + i" [value]="x.title" (input)="setItem('sections', i, { title: val($event) })" maxlength="80" [placeholder]="'cv.sectionKinds.' + x.kind | t" /></div>
                </div>
                <div class="field"><label [for]="'se-i' + i">{{ 'cv.fields.items' | t }}</label>
                  <textarea class="input" [id]="'se-i' + i" rows="3" [value]="lines(x.items)" (input)="setItem('sections', i, { items: fromLines($event) })"></textarea>
                  <small class="muted small">{{ 'cv.fields.onePerLine' | t }}</small></div>
                <div class="cv-entry-actions">
                  <button type="button" class="btn btn-sm btn-danger-text" (click)="remove('sections', i)"><app-icon name="trash" [size]="14" /> {{ 'cv.actions.remove' | t }}</button>
                </div>
              </fieldset>
            }
            <button type="button" class="btn btn-secondary" (click)="add('sections', blank.section())"><app-icon name="plus" [size]="15" /> {{ 'cv.actions.addSection' | t }}</button>
          }
        }
      </div>

      <div class="cv-step-nav">
        <button type="button" class="btn btn-ghost" (click)="go(-1)" [disabled]="index() === 0"><app-icon name="chevron-left" [size]="15" /> {{ 'common.back' | t }}</button>
        @if (index() < steps.length - 1) {
          <button type="button" class="btn btn-secondary" (click)="go(1)">{{ 'cv.steps.' + steps[index() + 1] | t }} <app-icon name="chevron-right" [size]="15" /></button>
        }
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 14px; }
    .cv-steps { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
    .cv-step { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-2); font-size: .85rem; cursor: pointer; white-space: nowrap; }
    .cv-step.active { background: var(--accent-soft); color: var(--accent-text); border-color: var(--accent); font-weight: 600; }
    .cv-step-num { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--surface-3); font-size: .72rem; }
    .cv-step.active .cv-step-num { background: var(--accent); color: var(--on-accent); }
    .cv-step-body { display: flex; flex-direction: column; gap: 12px; }
    .cv-grid { display: grid; gap: 10px 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); }
    .cv-span { grid-column: 1 / -1; }
    .cv-entry { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; margin: 0; display: flex; flex-direction: column; gap: 10px; background: var(--surface); }
    .cv-entry legend { padding: 0 6px; font-weight: 600; font-size: .9rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
    .cv-entry-actions { display: flex; gap: 6px; justify-content: flex-end; align-items: center; }
    .cv-skill-row { flex-direction: row; align-items: flex-end; flex-wrap: wrap; }
    .cv-skill-row .field:first-child { flex: 0 1 180px; }
    .cv-row-remove { margin-bottom: 4px; }
    .cv-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .cv-photo { display: flex; flex-direction: column; gap: 6px; }
    .cv-label { font-weight: 600; font-size: .9rem; }
    .cv-photo-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .cv-photo-img { width: 64px; height: 64px; object-fit: cover; border-radius: 50%; border: 1px solid var(--border); }
    .cv-step-nav { display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `,
})
export class CvContentComponent {
  protected readonly state = inject(CvEditorState);
  protected readonly api = inject(CvApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly errorText = useCvErrors();

  /** Which step is open; the editor page sets it when the ATS check points at a section. */
  readonly step = model<ContentStep>('personal');
  protected readonly steps = CONTENT_STEPS;
  protected readonly index = computed(() => CONTENT_STEPS.indexOf(this.step()));
  protected readonly blank = blank;
  protected readonly kinds = SECTION_KINDS;
  protected readonly personalFields: { key: keyof CvPersonal; type: string; auto: string; wide?: boolean }[] = [
    { key: 'fullName', type: 'text', auto: 'name' }, { key: 'title', type: 'text', auto: 'organization-title' },
    { key: 'email', type: 'email', auto: 'email' }, { key: 'phone', type: 'tel', auto: 'tel' },
    { key: 'location', type: 'text', auto: 'address-level2' }, { key: 'linkedIn', type: 'url', auto: 'url' },
    { key: 'gitHub', type: 'url', auto: 'url' }, { key: 'website', type: 'url', auto: 'url' },
  ];
  protected readonly uploading = signal(false);

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }
  protected checked(e: Event): boolean { return (e.target as HTMLInputElement).checked; }
  protected lines(items: string[]): string { return items.join('\n'); }
  protected fromLines(e: Event): string[] { return this.val(e).split('\n'); }
  protected fromCommas(e: Event): string[] { return this.val(e).split(','); }

  protected go(delta: number): void { this.step.set(CONTENT_STEPS[Math.min(Math.max(this.index() + delta, 0), CONTENT_STEPS.length - 1)]); }

  protected edit(change: (c: CvContent) => CvContent): void { this.state.edit(change); }

  protected setPersonal(key: keyof CvPersonal, value: string): void {
    this.state.edit(c => ({ ...c, personal: { ...c.personal, [key]: value } }));
  }

  protected setItem(key: ListKey, index: number, patch: object): void {
    this.state.edit(c => ({ ...c, [key]: (c[key] as object[]).map((x, i) => (i === index ? { ...x, ...patch } : x)) }));
  }

  protected add(key: ListKey, item: object): void {
    this.state.edit(c => ({ ...c, [key]: [...(c[key] as object[]), item] }));
  }

  protected move(key: ListKey, index: number, delta: number): void {
    this.state.edit(c => {
      const list = [...(c[key] as object[])];
      const j = index + delta;
      if (j < 0 || j >= list.length) return c;
      [list[index], list[j]] = [list[j], list[index]];
      return { ...c, [key]: list };
    });
  }

  protected async remove(key: ListKey, index: number): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('cv.actions.removeConfirm'), danger: true, confirmText: this.i18n.t('cv.actions.remove') }))) return;
    this.state.edit(c => ({ ...c, [key]: (c[key] as object[]).filter((_, i) => i !== index) }));
  }

  protected async uploadPhoto(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 300 * 1024) { this.toast.error(this.i18n.t('cv.errors.photo_too_large')); return; }
    this.uploading.set(true);
    try {
      const summary = await this.api.setPhoto(this.state.id(), file);
      if (this.state.template()?.supportsPhoto && !this.state.style()?.showPhoto) this.state.setStyle({ showPhoto: true });
      this.state.photoChanged(summary);
    } catch (err) {
      this.toast.error(this.errorText(err));
    } finally {
      this.uploading.set(false);
    }
  }

  protected async removePhoto(): Promise<void> {
    try {
      this.state.photoChanged(await this.api.deletePhoto(this.state.id()));
    } catch (err) {
      this.toast.error(this.errorText(err));
    }
  }
}

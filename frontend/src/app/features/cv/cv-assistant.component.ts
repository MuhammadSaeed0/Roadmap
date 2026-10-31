import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { SkeletonComponent } from '../../shared/ui.components';
import { CvAiAction, CvAiResult, CvApiService } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';
import { useCvErrors } from './cv-strings';

/** The part of the CV a text action works on. */
interface Target { key: string; kind: 'summary' | 'experience' | 'project'; index: number; label: string; text: string; }

/**
 * The AI assistant. It works on the saved CV (so the editor saves first), and every answer is a proposal:
 * the user applies it, adds single skills, or discards it.
 */
@Component({
  selector: 'app-cv-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, SkeletonComponent],
  template: `
    <p class="muted small">{{ 'cv.ai.intro' | t }}</p>
    @if (status.initialLoading()) {
      <app-skeleton [rows]="2" />
    } @else if (!status.value()?.enabled) {
      <p class="callout callout-info small" role="status"><app-icon name="info" [size]="15" /> {{ 'cv.ai.notConfigured' | t }}</p>
    } @else {
      <div class="field">
        <label for="ai-role">{{ 'cv.ai.targetRole' | t }}</label>
        <input id="ai-role" class="input" maxlength="120" [value]="role()" (input)="role.set(val($event))" placeholder="Junior .NET Developer" />
      </div>

      <section class="cv-ai-group">
        <h3>{{ 'cv.ai.whole' | t }}</h3>
        <div class="cv-ai-actions">
          <button type="button" class="btn btn-sm btn-secondary" (click)="run('summary')" [disabled]="busy()"><app-icon name="sparkle" [size]="14" /> {{ 'cv.ai.summary' | t }}</button>
          <button type="button" class="btn btn-sm btn-secondary" (click)="run('missing')" [disabled]="busy()"><app-icon name="search" [size]="14" /> {{ 'cv.ai.missing' | t }}</button>
          <button type="button" class="btn btn-sm btn-secondary" (click)="run('skills')" [disabled]="busy()"><app-icon name="layers" [size]="14" /> {{ 'cv.ai.skills' | t }}</button>
        </div>
      </section>

      <section class="cv-ai-group">
        <h3>{{ 'cv.ai.part' | t }}</h3>
        <div class="field">
          <label for="ai-target">{{ 'cv.ai.target' | t }}</label>
          <select id="ai-target" class="input" (change)="targetKey.set(val($event))">
            @for (t of targets(); track t.key) { <option [value]="t.key" [selected]="t.key === target()?.key">{{ t.label }}</option> }
          </select>
        </div>
        @if (target(); as t) {
          @if (!t.text.trim()) { <p class="small muted">{{ 'cv.ai.emptyTarget' | t }}</p> }
          <div class="cv-ai-actions">
            @if (t.kind === 'project') {
              <button type="button" class="btn btn-sm btn-secondary" (click)="run('project', t)" [disabled]="busy() || !t.text.trim()">{{ 'cv.ai.project' | t }}</button>
            } @else {
              <button type="button" class="btn btn-sm btn-secondary" (click)="run('improve-text', t)" [disabled]="busy() || !t.text.trim()">{{ 'cv.ai.improve' | t }}</button>
              @if (t.kind === 'experience') {
                <button type="button" class="btn btn-sm btn-secondary" (click)="run('bullets', t)" [disabled]="busy() || !t.text.trim()">{{ 'cv.ai.bullets' | t }}</button>
              }
              <button type="button" class="btn btn-sm btn-secondary" (click)="run('concise', t)" [disabled]="busy() || !t.text.trim()">{{ 'cv.ai.concise' | t }}</button>
              <button type="button" class="btn btn-sm btn-secondary" (click)="run('ats', t)" [disabled]="busy() || !t.text.trim()">{{ 'cv.ai.ats' | t }}</button>
            }
          </div>
        }
      </section>

      @if (busy()) { <p class="small muted" role="status"><span class="spinner" aria-hidden="true"></span> {{ 'cv.ai.working' | t }}</p> }
      @if (error()) { <p class="callout callout-danger small" role="alert">{{ error() }}</p> }

      @if (result(); as r) {
        <section class="card cv-ai-result" aria-live="polite">
          <h3><app-icon name="sparkle" [size]="15" /> {{ 'cv.ai.result' | t }}</h3>
          @if (r.text) { <p class="cv-ai-text">{{ r.text }}</p> }
          @if (r.bullets.length) { <ul>@for (b of r.bullets; track $index) { <li>{{ b }}</li> }</ul> }
          @if (r.suggestions.length) {
            <ul class="cv-ai-sugs">
              @for (s of r.suggestions; track $index) {
                <li>
                  @if (r.action === 'skills') {
                    <span class="grow"><strong>{{ s.suggestion }}</strong> <span class="muted small">· {{ s.section }}</span></span>
                    @if (hasSkill(s.suggestion)) { <app-icon name="check" [size]="14" /> }
                    @else { <button type="button" class="btn btn-xs btn-secondary" (click)="addSkill(s.section, s.suggestion)">{{ 'cv.ai.addSkill' | t }}</button> }
                  } @else {
                    <span class="grow"><span class="chip chip-sm">{{ s.section }}</span> {{ s.suggestion }}</span>
                  }
                </li>
              }
            </ul>
          }
          @if (r.notes.length) {
            <h4 class="small">{{ 'cv.ai.notes' | t }}</h4>
            <ul class="small muted">@for (n of r.notes; track $index) { <li>{{ n }}</li> }</ul>
          }
          @if (applicable()) { <p class="small muted">{{ 'cv.ai.replaceWarning' | t }}</p> }
          <div class="cv-ai-actions">
            @if (applicable()) { <button type="button" class="btn btn-sm btn-primary" (click)="apply()"><app-icon name="check" [size]="14" /> {{ 'cv.ai.apply' | t }}</button> }
            <button type="button" class="btn btn-sm btn-ghost" (click)="result.set(null)">{{ 'cv.ai.discard' | t }}</button>
          </div>
          <p class="small muted">{{ 'cv.ai.disclaimer' | t }}</p>
        </section>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 12px; }
    .cv-ai-group h3 { font-size: .9rem; margin: 0 0 6px; }
    .cv-ai-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .cv-ai-result { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-color: var(--accent); }
    .cv-ai-result h3 { display: flex; gap: 6px; align-items: center; font-size: .95rem; margin: 0; color: var(--accent-text); }
    .cv-ai-text { white-space: pre-wrap; margin: 0; }
    .cv-ai-result ul { margin: 0; padding-inline-start: 18px; }
    .cv-ai-sugs { list-style: none; padding: 0 !important; }
    .cv-ai-sugs li { display: flex; gap: 8px; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--border); }
    .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--border-strong); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; vertical-align: -2px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class CvAssistantComponent {
  private readonly api = inject(CvApiService);
  private readonly state = inject(CvEditorState);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly errorText = useCvErrors();

  protected readonly status = createLoader(() => this.api.aiStatus());
  protected readonly role = signal(this.state.content()?.personal.title ?? '');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly result = signal<CvAiResult | null>(null);
  /** The part the current result is for, so "Apply" writes to the right place. */
  private readonly resultTarget = signal<Target | null>(null);
  protected readonly targetKey = signal('summary');

  protected readonly targets = computed<Target[]>(() => {
    const c = this.state.content();
    if (!c) return [];
    return [
      { key: 'summary', kind: 'summary', index: 0, label: this.i18n.t('cv.ai.targetSummary'), text: c.summary },
      ...c.experience.map((x, i): Target => ({
        key: 'experience-' + i, kind: 'experience', index: i, label: this.i18n.t('cv.ai.targetExperience', { name: x.title || x.company || i + 1 }),
        text: [...x.responsibilities, ...x.achievements].filter(l => l.trim()).join('\n'),
      })),
      ...c.projects.map((p, i): Target => ({
        key: 'project-' + i, kind: 'project', index: i, label: this.i18n.t('cv.ai.targetProject', { name: p.name || i + 1 }),
        text: [p.description, ...p.highlights].filter(l => l.trim()).join('\n'),
      })),
    ];
  });
  protected readonly target = computed(() => this.targets().find(t => t.key === this.targetKey()) ?? this.targets()[0] ?? null);

  /** Results that replace a part of the CV (summary, an entry's bullets, a project). */
  protected readonly applicable = computed(() => {
    const r = this.result(), t = this.resultTarget();
    if (!r) return false;
    if (r.action === 'summary') return !!r.text;
    if (!t) return false;
    return t.kind === 'experience' ? r.bullets.length > 0 || !!r.text : !!r.text || r.bullets.length > 0;
  });

  private readonly skillNames = computed(() =>
    new Set((this.state.content()?.skills ?? []).flatMap(g => g.items).map(s => s.trim().toLowerCase())));
  protected hasSkill(name: string): boolean { return this.skillNames().has(name.trim().toLowerCase()); }

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }

  protected async run(action: CvAiAction, target: Target | null = null): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    this.result.set(null);
    try {
      if (!(await this.state.flush())) { this.error.set(this.state.saveError()); return; }   // the assistant reads the saved CV
      const r = await this.api.ai(this.state.id(), {
        action, text: target?.text ?? null, context: target?.label ?? null, targetRole: this.role().trim() || null,
      });
      this.resultTarget.set(target);
      this.result.set(r);
    } catch (e) {
      this.error.set(this.errorText(e));
    } finally {
      this.busy.set(false);
    }
  }

  protected apply(): void {
    const r = this.result(), t = this.resultTarget();
    if (!r) return;
    if (r.action === 'summary' || t?.kind === 'summary') {
      this.state.edit(c => ({ ...c, summary: r.text ?? c.summary }));
    } else if (t?.kind === 'experience') {
      const bullets = r.bullets.length ? r.bullets : (r.text ?? '').split('\n').filter(l => l.trim());
      this.state.edit(c => ({ ...c, experience: c.experience.map((x, i) => (i === t.index ? { ...x, responsibilities: bullets, achievements: [] } : x)) }));
    } else if (t?.kind === 'project') {
      this.state.edit(c => ({
        ...c,
        projects: c.projects.map((p, i) => (i === t.index
          ? { ...p, description: r.text ?? p.description, highlights: r.bullets.length ? r.bullets : p.highlights } : p)),
      }));
    }
    this.result.set(null);
    this.toast.success(this.i18n.t('cv.ai.applied'));
  }

  protected addSkill(category: string, name: string): void {
    this.state.edit(c => {
      const groups = [...c.skills];
      const i = groups.findIndex(g => g.category.trim().toLowerCase() === category.trim().toLowerCase());
      if (i >= 0) groups[i] = { ...groups[i], items: [...groups[i].items.filter(x => x.trim()), name] };
      else groups.push({ category, items: [name] });
      return { ...c, skills: groups };
    });
  }
}

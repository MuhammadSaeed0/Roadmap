import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { CvApiService, CvCourseworkSuggestion, CvProjectSuggestion, CvSkillSuggestion, EvidenceLevel } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';

const LEVEL_ICONS: Record<EvidenceLevel, string> = { verified: 'check-circle', built: 'branch', practiced: 'code', studied: 'book' };

/**
 * Skills, projects and coursework the platform can vouch for, each with its evidence. Nothing is added until
 * the user clicks "Add"; in-progress projects are added as in progress.
 */
@Component({
  selector: 'app-cv-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe, SkeletonComponent, ErrorStateComponent],
  template: `
    <p class="muted small">{{ 'cv.suggest.intro' | t }}</p>
    <ul class="cv-levels" role="list">
      @for (l of levels; track l) {
        <li><span class="cv-level" [attr.data-level]="l"><app-icon [name]="icons[l]" [size]="12" /> {{ 'cv.suggest.levels.' + l | t }}</span>
          <span class="small muted">{{ 'cv.suggest.levelHelp.' + l | t }}</span></li>
      }
    </ul>

    @if (data.initialLoading()) {
      <app-skeleton [rows]="4" />
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as s) {
      @if (!s.skills.length && !s.projects.length && !s.coursework.length) {
        <p class="callout small"><app-icon name="info" [size]="15" /> {{ 'cv.suggest.none' | t }}</p>
      }
      @if (s.skills.length) {
        <section class="cv-sug">
          <h3 class="cv-sug-h">{{ 'cv.suggest.skills' | t }}</h3>
          <ul role="list">
            @for (x of s.skills; track x.name) {
              <li class="cv-sug-row">
                <div class="grow">
                  <strong>{{ x.name }}</strong> <span class="small muted">· {{ x.category }}</span>
                  <div class="small"><span class="cv-level" [attr.data-level]="x.evidence.level"><app-icon [name]="icons[x.evidence.level]" [size]="12" /> {{ 'cv.suggest.levels.' + x.evidence.level | t }}</span>
                    <span class="muted">{{ x.evidence | loc: 'detail' }}</span></div>
                </div>
                @if (hasSkill(x.name)) { <span class="small cv-added"><app-icon name="check" [size]="13" /> {{ 'cv.suggest.added' | t }}</span> }
                @else { <button type="button" class="btn btn-xs btn-secondary" (click)="addSkill(x)">{{ 'cv.suggest.add' | t }}</button> }
              </li>
            }
          </ul>
        </section>
      }
      @if (s.projects.length) {
        <section class="cv-sug">
          <h3 class="cv-sug-h">{{ 'cv.suggest.projects' | t }}</h3>
          <ul role="list">
            @for (p of s.projects; track p.key) {
              <li class="cv-sug-row">
                <div class="grow">
                  <strong>{{ p.name }}</strong>
                  <span class="chip chip-sm" [class.chip-warn]="p.status === 'in-progress'">{{ (p.status === 'completed' ? 'cv.suggest.completed' : 'cv.suggest.inProgress') | t }}</span>
                  @if (p.tasksTotal > 1) { <span class="small muted">{{ 'cv.suggest.tasks' | t: { done: p.tasksDone, total: p.tasksTotal } }}</span> }
                  <div class="small muted">{{ p.technologies.join(' · ') }}</div>
                  <div class="small"><span class="cv-level" [attr.data-level]="p.evidence.level"><app-icon [name]="icons[p.evidence.level]" [size]="12" /> {{ 'cv.suggest.levels.' + p.evidence.level | t }}</span>
                    <span class="muted">{{ p.evidence | loc: 'detail' }}</span></div>
                </div>
                @if (hasProject(p.name)) { <span class="small cv-added"><app-icon name="check" [size]="13" /> {{ 'cv.suggest.added' | t }}</span> }
                @else { <button type="button" class="btn btn-xs btn-secondary" (click)="addProject(p)">{{ 'cv.suggest.addProject' | t }}</button> }
              </li>
            }
          </ul>
        </section>
      }
      @if (s.coursework.length) {
        <section class="cv-sug">
          <h3 class="cv-sug-h">{{ 'cv.suggest.coursework' | t }}</h3>
          <ul role="list">
            @for (c of s.coursework; track c.title) {
              <li class="cv-sug-row">
                <div class="grow"><strong>{{ c.title }}</strong>
                  <div class="small"><span class="cv-level" [attr.data-level]="c.evidence.level"><app-icon [name]="icons[c.evidence.level]" [size]="12" /> {{ 'cv.suggest.levels.' + c.evidence.level | t }}</span>
                    <span class="muted">{{ c.detail }}</span></div></div>
                @if (hasCoursework(c.title)) { <span class="small cv-added"><app-icon name="check" [size]="13" /> {{ 'cv.suggest.added' | t }}</span> }
                @else { <button type="button" class="btn btn-xs btn-secondary" (click)="addCoursework(c)">{{ 'cv.suggest.add' | t }}</button> }
              </li>
            }
          </ul>
        </section>
      }
      <section class="cv-sug">
        <h3 class="cv-sug-h">{{ 'cv.suggest.certTitle' | t }}</h3>
        <p class="callout callout-warn small"><app-icon name="award" [size]="15" /> {{ s | loc: 'certificationsNote' }}</p>
      </section>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 12px; }
    ul { list-style: none; margin: 0; padding: 0; }
    .cv-levels { display: grid; gap: 4px 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); }
    .cv-levels li { display: flex; gap: 6px; align-items: center; }
    .cv-level { display: inline-flex; align-items: center; gap: 3px; padding: 1px 7px; border-radius: 999px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
    .cv-level[data-level='verified'] { background: var(--success-soft); color: var(--success); }
    .cv-level[data-level='built'] { background: var(--accent-soft); color: var(--accent-text); }
    .cv-level[data-level='practiced'] { background: var(--info-soft); color: var(--info); }
    .cv-level[data-level='studied'] { background: var(--surface-3); color: var(--text-2); }
    .cv-sug-h { font-size: .95rem; margin: 0 0 6px; }
    .cv-sug-row { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .cv-sug-row .small { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 2px; }
    .cv-added { color: var(--success); display: inline-flex; gap: 3px; align-items: center; white-space: nowrap; }
  `,
})
export class CvSuggestionsComponent {
  private readonly api = inject(CvApiService);
  private readonly state = inject(CvEditorState);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly levels: EvidenceLevel[] = ['verified', 'built', 'practiced', 'studied'];
  protected readonly icons = LEVEL_ICONS;
  /** Suggestions in the CV's language (Arabic names for an Arabic CV). */
  private readonly lang = computed(() => (this.state.style()?.direction === 'rtl' ? 'ar' : 'en'));
  protected readonly data = createLoader(() => this.api.suggestions(this.lang()));

  private readonly skillNames = computed(() =>
    new Set((this.state.content()?.skills ?? []).flatMap(g => g.items).map(s => s.trim().toLowerCase())));

  protected hasSkill(name: string): boolean { return this.skillNames().has(name.toLowerCase()); }
  protected hasProject(name: string): boolean {
    return (this.state.content()?.projects ?? []).some(p => p.name.trim().toLowerCase() === name.toLowerCase());
  }
  protected hasCoursework(title: string): boolean {
    return (this.state.content()?.sections ?? []).some(s => s.kind === 'coursework' && s.items.some(i => i.trim() === title));
  }

  protected addSkill(s: CvSkillSuggestion): void {
    this.state.edit(c => {
      const groups = [...c.skills];
      const i = groups.findIndex(g => g.category.trim().toLowerCase() === s.category.toLowerCase());
      if (i >= 0) groups[i] = { ...groups[i], items: [...groups[i].items.filter(x => x.trim()), s.name] };
      else groups.push({ category: s.category, items: [s.name] });
      return { ...c, skills: groups };
    });
  }

  protected addProject(p: CvProjectSuggestion): void {
    const inProgress = p.status !== 'completed';
    this.state.edit(c => ({
      ...c,
      projects: [...c.projects, {
        name: p.name, description: p.description, technologies: [...p.technologies], highlights: [...p.highlights],
        repoUrl: p.repoUrl, demoUrl: '', date: inProgress ? (this.lang() === 'ar' ? 'قيد التنفيذ' : 'In progress') : p.date,   // in the CV's language
      }],
    }));
    if (inProgress) this.toast.info(this.i18n.t('cv.suggest.inProgressNote'));
  }

  protected addCoursework(cw: CvCourseworkSuggestion): void {
    this.state.edit(c => {
      const sections = [...c.sections];
      const i = sections.findIndex(s => s.kind === 'coursework');
      if (i >= 0) sections[i] = { ...sections[i], items: [...sections[i].items.filter(x => x.trim()), cw.title] };
      else sections.push({ kind: 'coursework', title: '', items: [cw.title] });
      return { ...c, sections };
    });
  }
}

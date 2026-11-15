import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Difficulty, GuidedProjectSummary, SKILLS, SkillArea } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

const LEVELS: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
const GROUPS_KEY = 'devpath.guideGroups';

function readOpenGroups(): ReadonlySet<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

/** The Project library: every guided project, grouped by skill, filtered by skill, level and text. */
@Component({
  selector: 'app-guides-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './guides.css',
  imports: [RouterLink, IconComponent, TranslatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent, ProgressBarComponent],
  template: `
    <app-page-header [title]="'guides.title' | t" [subtitle]="'guides.subtitle' | t" />

    <div class="card guide-filters" data-tour="guides-filters">
      <label class="sr-only" for="guide-search">{{ 'guides.search' | t }}</label>
      <input id="guide-search" class="input" type="search" [placeholder]="'guides.search' | t" [value]="search()"
             (input)="search.set($any($event.target).value)" />
      <label class="sr-only" for="guide-skill">{{ 'guides.allSkills' | t }}</label>
      <select id="guide-skill" class="input" (change)="setSkill($any($event.target).value)">
        <option value="" [selected]="skill() === ''">{{ 'guides.allSkills' | t }}</option>
        @for (s of skills; track s) { <option [value]="s" [selected]="skill() === s">{{ 'skills.' + s | t }}</option> }
      </select>
      <div class="segmented" role="radiogroup" [attr.aria-label]="'guides.allLevels' | t">
        <button type="button" role="radio" [attr.aria-checked]="level() === ''" [class.active]="level() === ''" (click)="setLevel('')">{{ 'guides.allLevels' | t }}</button>
        @for (l of levels; track l) {
          <button type="button" role="radio" [attr.aria-checked]="level() === l" [class.active]="level() === l" (click)="setLevel(l)">{{ 'guides.levels.' + l | t }}</button>
        }
      </div>
    </div>

    @if (data.initialLoading()) {
      <div class="guide-grid">@for (i of [1, 2, 3]; track i) { <div class="card"><app-skeleton [rows]="4" /></div> }</div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (groups().length === 0) {
      <app-empty-state icon="search" [title]="'guides.empty' | t" />
    } @else {
      <div class="guide-list-head">
        <p class="muted small" aria-live="polite">{{ 'guides.showing' | t: { n: count() } }}</p>
        <button type="button" class="btn btn-ghost btn-sm" (click)="toggleAll()">
          {{ (allOpen() ? 'guides.closeGroups' : 'guides.openGroups') | t }}
        </button>
      </div>
      <div class="guide-groups" data-tour="guides-list">
        @for (g of groups(); track g.skill) {
          @let isOpen = isGroupOpen(g.skill);
          <section class="guide-group card" [class.open]="isOpen">
            <h2 class="guide-group-head">
              <button type="button" class="guide-group-toggle" [attr.aria-expanded]="isOpen" [attr.aria-controls]="'gs-' + g.skill"
                      (click)="toggleGroup(g.skill)">
                <app-icon name="chevron-down" [size]="18" class="chev" />
                <span class="guide-group-name">{{ 'skills.' + g.skill | t }}</span>
                <span class="guide-group-meta">
                  {{ 'guides.showing' | t: { n: g.items.length } }}
                  @if (finishedIn(g.items) > 0) { · {{ finishedIn(g.items) }} {{ 'guides.finished' | t }} }
                </span>
              </button>
            </h2>
            @if (isOpen) {
            <div class="guide-grid" [id]="'gs-' + g.skill">
              @for (p of g.items; track p.id) {
                <a class="card guide-card" [routerLink]="['/project-library', p.id]">
                  <div class="guide-card-head">
                    <span class="level-badge" [attr.data-level]="p.level">{{ 'guides.levels.' + p.level | t }}</span>
                    @if (p.doneSteps === p.stepCount) {
                      <span class="badge badge-success"><app-icon name="check" [size]="12" /> {{ 'guides.finished' | t }}</span>
                    } @else if (p.doneSteps > 0) {
                      <span class="badge">{{ 'guides.started' | t }}</span>
                    }
                  </div>
                  <h3 class="guide-card-title">{{ i18n.pick(p.titleEn, p.titleAr) }}</h3>
                  <p class="guide-card-summary">{{ i18n.pick(p.summaryEn, p.summaryAr) }}</p>
                  <p class="guide-card-stack" dir="ltr">{{ p.techStack }}</p>
                  <div class="guide-card-foot">
                    <span><app-icon name="clock" [size]="13" /> {{ 'guides.hours' | t: { n: p.estimatedHours } }}</span>
                    <span>{{ 'guides.progress' | t: { done: p.doneSteps, total: p.stepCount } }}</span>
                  </div>
                  <app-progress-bar [value]="percent(p)" [small]="true" [tone]="p.doneSteps === p.stepCount ? 'success' : 'accent'" [label]="i18n.pick(p.titleEn, p.titleAr)" />
                </a>
              }
            </div>
            }
          </section>
        }
      </div>
    }
  `,
})
export default class GuidesPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly skills = SKILLS;
  protected readonly levels = LEVELS;
  protected readonly data = createLoader(() => this.api.guidedProjects());

  private readonly query = this.route.snapshot.queryParamMap;
  protected readonly skill = signal<SkillArea | ''>((SKILLS as string[]).includes(this.query.get('skill') ?? '') ? this.query.get('skill') as SkillArea : '');
  protected readonly level = signal<Difficulty | ''>((LEVELS as string[]).includes(this.query.get('level') ?? '') ? this.query.get('level') as Difficulty : '');
  protected readonly search = signal('');

  private readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return (this.data.value() ?? []).filter(p =>
      (!this.skill() || p.skill === this.skill()) &&
      (!this.level() || p.level === this.level()) &&
      (!term || [p.titleEn, p.titleAr, p.summaryEn, p.summaryAr, p.techStack].some(t => t.toLowerCase().includes(term))));
  });

  /** Projects grouped by skill in the roadmap's skill order, easiest first inside each group. */
  protected readonly groups = computed(() => SKILLS
    .map(skill => ({ skill, items: this.filtered().filter(p => p.skill === skill)
      .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.id - b.id) }))
    .filter(g => g.items.length > 0));

  protected readonly count = computed(() => this.filtered().length);

  /** Skill groups the learner opened, remembered in this browser. Searching or filtering by skill opens the matches. */
  private readonly openGroups = signal<ReadonlySet<string>>(readOpenGroups());
  private readonly filtering = computed(() => this.search().trim().length > 0 || this.skill() !== '');

  protected isGroupOpen(skill: string): boolean { return this.filtering() || this.openGroups().has(skill); }
  protected readonly allOpen = computed(() => this.groups().every(g => this.isGroupOpen(g.skill)));

  protected toggleGroup(skill: string): void {
    const next = new Set(this.openGroups());
    if (this.isGroupOpen(skill)) next.delete(skill); else next.add(skill);
    this.saveGroups(next);
  }

  protected toggleAll(): void {
    this.saveGroups(this.allOpen() ? new Set() : new Set(this.groups().map(g => g.skill)));
  }

  protected finishedIn(items: GuidedProjectSummary[]): number { return items.filter(p => p.stepCount > 0 && p.doneSteps === p.stepCount).length; }

  private saveGroups(groups: ReadonlySet<string>): void {
    this.openGroups.set(groups);
    try { localStorage.setItem(GROUPS_KEY, JSON.stringify([...groups])); } catch { /* storage unavailable */ }
  }

  protected setSkill(value: string): void { this.skill.set(value as SkillArea | ''); this.syncUrl(); }
  protected setLevel(value: Difficulty | ''): void { this.level.set(value); this.syncUrl(); }

  protected percent(p: GuidedProjectSummary): number { return p.stepCount ? (p.doneSteps / p.stepCount) * 100 : 0; }

  /** Keeps the filters in the address so a filtered list can be shared or reopened. */
  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route, replaceUrl: true,
      queryParams: { skill: this.skill() || null, level: this.level() || null },
    });
  }
}

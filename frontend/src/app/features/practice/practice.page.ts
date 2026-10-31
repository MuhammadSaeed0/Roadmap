import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { DIFFICULTIES, Difficulty, EXERCISE_TYPES, ExerciseType, PracticeStatus, SKILLS, SkillArea } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

export const TYPE_ICONS: Record<ExerciseType, string> = {
  Coding: 'code', Debugging: 'bug', Scenario: 'briefcase', CodeReview: 'eye', Conceptual: 'bulb', Practical: 'settings',
  MiniProject: 'folder', FullStack: 'layers', Challenge: 'flame',
};

type Filters = { q: string; skill: SkillArea | ''; type: ExerciseType | ''; difficulty: Difficulty | ''; status: PracticeStatus | ''; runnable: boolean };

@Component({
  selector: 'app-practice-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, PageHeaderComponent,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'practice.title' | t" [subtitle]="'practice.subtitle' | t">
      <a routerLink="/playground" class="btn btn-secondary btn-sm"><app-icon name="terminal" [size]="15" /> {{ 'nav.playground' | t }}</a>
    </app-page-header>

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as overview) {
      <section class="card practice-overview" aria-labelledby="po-h" data-tour="practice-types">
        <div class="card-head">
          <h2 id="po-h" class="card-title"><app-icon name="chart" /> {{ 'practice.progressTitle' | t }}</h2>
          <span class="muted small">{{ 'practice.overall' | t: { done: overview.completed, total: overview.total, attempted: overview.attempted } }}</span>
        </div>
        <div class="skill-progress-grid">
          @for (s of overview.skills; track s.skill) {
            <button type="button" class="skill-progress" [class.selected]="filters().skill === s.skill" (click)="set('skill', filters().skill === s.skill ? '' : s.skill)"
                    [attr.aria-pressed]="filters().skill === s.skill">
              <span class="skill-progress-head"><strong>{{ 'skills.' + s.skill | t }}</strong><span class="chip chip-sm" [attr.data-difficulty]="s.level">{{ 'difficulty.' + s.level | t }}</span></span>
              <app-progress-bar [value]="s.total ? (s.completed / s.total) * 100 : 0" [small]="true" tone="success" [label]="'skills.' + s.skill | t" />
              <span class="small muted">{{ 'practice.skillLine' | t: { done: s.completed, left: s.total - s.completed } }}</span>
            </button>
          }
        </div>
      </section>

      <div class="toolbar practice-filters" data-tour="practice-filters">
        <label class="sr-only" for="pr-q">{{ 'practice.search' | t }}</label>
        <input id="pr-q" class="input input-sm" type="search" [ngModel]="filters().q" (ngModelChange)="set('q', $event)" [placeholder]="'practice.search' | t">
        <label class="sr-only" for="pr-skill">{{ 'library.allSkills' | t }}</label>
        <select id="pr-skill" class="input input-sm" [ngModel]="filters().skill" (ngModelChange)="set('skill', $event)">
          <option value="">{{ 'library.allSkills' | t }}</option>
          @for (s of skills; track s) { <option [value]="s">{{ 'skills.' + s | t }}</option> }
        </select>
        <label class="sr-only" for="pr-type">{{ 'practice.allTypes' | t }}</label>
        <select id="pr-type" class="input input-sm" [ngModel]="filters().type" (ngModelChange)="set('type', $event)">
          <option value="">{{ 'practice.allTypes' | t }}</option>
          @for (t of types(); track t) { <option [value]="t">{{ 'exerciseType.' + t | t }}</option> }
        </select>
        <label class="sr-only" for="pr-diff">{{ 'practice.allDifficulties' | t }}</label>
        <select id="pr-diff" class="input input-sm" [ngModel]="filters().difficulty" (ngModelChange)="set('difficulty', $event)">
          <option value="">{{ 'practice.allDifficulties' | t }}</option>
          @for (d of difficulties; track d) { <option [value]="d">{{ 'difficulty.' + d | t }}</option> }
        </select>
        <label class="sr-only" for="pr-status">{{ 'practice.anyStatus' | t }}</label>
        <select id="pr-status" class="input input-sm" [ngModel]="filters().status" (ngModelChange)="set('status', $event)">
          <option value="">{{ 'practice.anyStatus' | t }}</option>
          @for (s of statuses; track s) { <option [value]="s">{{ 'practiceStatus.' + s | t }}</option> }
        </select>
        <label class="check-label small"><input type="checkbox" [ngModel]="filters().runnable" (ngModelChange)="set('runnable', $event)"> {{ 'practice.runnableOnly' | t }}</label>
        @if (filtered()) { <button type="button" class="btn btn-ghost btn-sm" (click)="clear()">{{ 'common.clear' | t }}</button> }
      </div>
      <p class="muted small" aria-live="polite">{{ 'practice.showing' | t: { n: visible().length, total: overview.total } }}</p>

      @if (visible().length === 0) {
        <app-empty-state icon="code" [title]="'practice.empty' | t" />
      } @else {
        <div class="grid grid-3" data-tour="practice-list">
          @for (e of visible(); track e.id) {
            <a class="card exercise-card" [routerLink]="['/practice', e.id]" [attr.data-status]="e.status">
              <div class="exercise-card-head">
                <span class="type-pill" [attr.data-type]="e.type"><app-icon [name]="icon(e.type)" [size]="14" /> {{ 'exerciseType.' + e.type | t }}</span>
                <app-icon [name]="statusIcon(e.status)" class="status-icon" [attr.data-status]="e.status" />
              </div>
              <h3>{{ e | loc: 'title' }}</h3>
              <p class="muted small">{{ e | loc: 'topicTitle' }}</p>
              <div class="chips">
                <span class="chip chip-sm" [attr.data-difficulty]="e.difficulty">{{ 'difficulty.' + e.difficulty | t }}</span>
                <span class="chip chip-sm chip-ghost"><app-icon name="clock" [size]="12" /> {{ e.estimatedMinutes | duration }}</span>
                @if (e.runner !== 'None') { <span class="chip chip-sm chip-ghost"><app-icon name="play" [size]="11" /> {{ ('practice.runner.' + e.runner) | t }}</span> }
                @for (s of e.technologies; track s) { <span class="chip chip-sm chip-ghost">{{ 'skills.' + s | t }}</span> }
                @if (e.bestScore !== null) { <span class="chip chip-sm" [attr.data-practice]="e.bestScore === 100 ? 'Completed' : 'Attempted'">{{ e.bestScore }}%</span> }
                @else { <span class="chip chip-sm" [attr.data-practice]="e.status">{{ 'practiceStatus.' + e.status | t }}</span> }
              </div>
            </a>
          }
        </div>
      }
    }
  `,
})
export default class PracticePage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly skills = SKILLS;
  protected readonly difficulties = DIFFICULTIES;
  protected readonly statuses: PracticeStatus[] = ['NotStarted', 'Attempted', 'Completed'];
  protected readonly statusIcon = statusIcon;
  protected readonly filters = signal<Filters>(this.fromQuery());

  /** Every exercise is loaded once; filtering is instant in the browser and the stats always cover everything. */
  protected readonly data = createLoader(() => this.api.practice());
  /** Only the types that have exercises. */
  protected readonly types = computed(() => EXERCISE_TYPES.filter(t => this.data.value()?.stats.some(s => s.type === t)));
  protected readonly filtered = computed(() => {
    const f = this.filters();
    return !!(f.q || f.skill || f.type || f.difficulty || f.status || f.runnable);
  });
  protected readonly visible = computed(() => {
    const f = this.filters();
    const q = f.q.trim().toLowerCase();
    return (this.data.value()?.exercises ?? []).filter(e =>
      (!f.skill || e.skill === f.skill || e.technologies.includes(f.skill)) &&
      (!f.type || e.type === f.type) &&
      (!f.difficulty || e.difficulty === f.difficulty) &&
      (!f.status || e.status === f.status) &&
      (!f.runnable || e.runner !== 'None') &&
      (!q || e.titleEn.toLowerCase().includes(q) || e.titleAr.includes(q) || e.topicTitleEn.toLowerCase().includes(q) || e.topicTitleAr.includes(q)));
  });

  protected icon(type: ExerciseType): string { return TYPE_ICONS[type]; }

  protected set<K extends keyof Filters>(key: K, value: Filters[K]): void {
    this.filters.update(f => ({ ...f, [key]: value }));
    const f = this.filters();
    void this.router.navigate([], {
      queryParams: { q: f.q || null, skill: f.skill || null, type: f.type || null, difficulty: f.difficulty || null, status: f.status || null, run: f.runnable ? 1 : null },
      replaceUrl: true,
    });
  }

  protected clear(): void {
    this.filters.set({ q: '', skill: '', type: '', difficulty: '', status: '', runnable: false });
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private fromQuery(): Filters {
    const p = this.route.snapshot.queryParamMap;
    return {
      q: p.get('q') ?? '', skill: (p.get('skill') ?? '') as SkillArea | '', type: (p.get('type') ?? '') as ExerciseType | '',
      difficulty: (p.get('difficulty') ?? '') as Difficulty | '', status: (p.get('status') ?? '') as PracticeStatus | '', runnable: p.get('run') === '1',
    };
  }
}

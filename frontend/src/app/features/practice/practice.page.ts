import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { EXERCISE_TYPES, ExerciseType, SKILLS, SkillArea } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

export const TYPE_ICONS: Record<ExerciseType, string> = { Coding: 'code', Debugging: 'bug', Scenario: 'briefcase', CodeReview: 'eye' };

@Component({
  selector: 'app-practice-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, PageHeaderComponent,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'practice.title' | t" [subtitle]="'practice.subtitle' | t" />

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as overview) {
      <div class="grid grid-4 stat-cards">
        @for (s of overview.stats; track s.type) {
          <button type="button" class="card stat-card" [class.selected]="type() === s.type" (click)="setType(type() === s.type ? '' : s.type)"
                  [attr.aria-pressed]="type() === s.type">
            <span class="stat-icon"><app-icon [name]="icon(s.type)" /></span>
            <span class="stat-label">{{ 'exerciseType.' + s.type | t }}</span>
            <span class="stat-value">{{ s.completed }}<small>/{{ s.total }}</small></span>
            <app-progress-bar [value]="s.total ? (s.completed / s.total) * 100 : 0" [small]="true" tone="success" [label]="'exerciseType.' + s.type | t" />
          </button>
        }
      </div>

      <div class="toolbar">
        <div class="segmented" role="radiogroup" [attr.aria-label]="'common.filters' | t">
          <button type="button" role="radio" [attr.aria-checked]="type() === ''" [class.active]="type() === ''" (click)="setType('')">{{ 'common.all' | t }}</button>
          @for (t of types; track t) {
            <button type="button" role="radio" [attr.aria-checked]="type() === t" [class.active]="type() === t" (click)="setType(t)">{{ 'exerciseType.' + t | t }}</button>
          }
        </div>
        <label class="sr-only" for="pr-skill">{{ 'library.allSkills' | t }}</label>
        <select id="pr-skill" class="input input-sm" (change)="setSkill($any($event.target).value)">
          <option value="">{{ 'library.allSkills' | t }}</option>
          @for (s of skills; track s) { <option [value]="s" [selected]="skill() === s">{{ 'skills.' + s | t }}</option> }
        </select>
      </div>
      <p class="muted small"><app-icon name="info" [size]="14" /> {{ 'practice.disclaimer' | t }}</p>

      @if (visible().length === 0) {
        <app-empty-state icon="code" [title]="'practice.empty' | t" />
      } @else {
        <div class="grid grid-3">
          @for (e of visible(); track e.id) {
            <a class="card exercise-card" [routerLink]="['/practice', e.id]" [attr.data-status]="e.status">
              <div class="exercise-card-head">
                <span class="type-pill" [attr.data-type]="e.type"><app-icon [name]="icon(e.type)" [size]="14" /> {{ 'exerciseType.' + e.type | t }}</span>
                <app-icon [name]="statusIcon(e.status)" class="status-icon" [attr.data-status]="e.status" />
              </div>
              <h3>{{ e | loc: 'title' }}</h3>
              <p class="muted small">{{ e | loc: 'topicTitle' }}</p>
              <div class="chips">
                <span class="chip chip-sm">{{ 'difficulty.' + e.difficulty | t }}</span>
                <span class="chip chip-sm chip-ghost"><app-icon name="clock" [size]="12" /> {{ e.estimatedMinutes | duration }}</span>
                <span class="chip chip-sm" [attr.data-practice]="e.status">{{ 'practiceStatus.' + e.status | t }}</span>
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

  protected readonly types = EXERCISE_TYPES;
  protected readonly skills = SKILLS;
  protected readonly statusIcon = statusIcon;
  protected readonly type = signal<ExerciseType | ''>((this.route.snapshot.queryParamMap.get('type') ?? '') as ExerciseType | '');
  protected readonly skill = signal<SkillArea | ''>('');

  /** The skill filter runs on the server (stats always cover all exercises); the type filter is instant in the browser. */
  protected readonly data = createLoader(() => this.api.practice({ skill: this.skill() }));
  protected readonly visible = computed(() => {
    const list = this.data.value()?.exercises ?? [];
    return list.filter(e => (!this.type() || e.type === this.type()));
  });

  protected icon(type: ExerciseType): string { return TYPE_ICONS[type]; }

  protected setSkill(skill: SkillArea | ''): void {
    this.skill.set(skill);
    void this.data.reload();
  }

  protected setType(type: ExerciseType | ''): void {
    this.type.set(type);
    void this.router.navigate([], { queryParams: { type: type || null }, replaceUrl: true });
  }
}

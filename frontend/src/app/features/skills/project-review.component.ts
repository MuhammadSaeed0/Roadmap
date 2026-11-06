import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';

/**
 * Rubric review of a project (architecture, code quality, testing ...), scored 0–4 per criterion.
 * It is the learner's own review, so it counts as self-reported, and only once the project is finished.
 */
@Component({
  selector: 'app-project-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe],
  styles: `
    .criteria { display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
    .criterion { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 0.86rem; }
    .scale { display: inline-flex; gap: 2px; }
    .scale button { min-width: 30px; padding: 4px 0; border: 1px solid var(--border); background: var(--surface-2); border-radius: var(--radius-xs); font-weight: 650; color: var(--text-2); cursor: pointer; }
    .scale button[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  `,
  template: `
    <section class="card" aria-labelledby="review-h" data-tour="project-review">
      <h2 id="review-h" class="card-title"><app-icon name="check-circle" /> {{ 'devLevel.review.title' | t }}</h2>
      <p class="small muted">{{ 'devLevel.review.intro' | t }}</p>
      @if (data.value(); as a) {
        @if (!a.countsTowardsLevel) {
          <p class="callout callout-info small"><app-icon name="info" [size]="14" /> {{ 'devLevel.review.notYet' | t }}</p>
        }
        <div class="criteria">
          @for (c of a.criteria; track c) {
            <div class="criterion">
              <span [id]="'crit-' + c">{{ 'devLevel.review.criteria.' + c | t }}</span>
              <span class="scale" role="group" [attr.aria-labelledby]="'crit-' + c">
                @for (v of [0, 1, 2, 3, 4]; track v) {
                  <button type="button" [attr.aria-pressed]="scores()[c] === v" (click)="set(c, v)"
                          [attr.aria-label]="('devLevel.review.criteria.' + c | t) + ': ' + v + ' — ' + ('devLevel.review.scale.' + v | t)"
                          [title]="'devLevel.review.scale.' + v | t">{{ v }}</button>
                }
              </span>
            </div>
          }
        </div>
        <label class="field">
          <span class="label">{{ 'devLevel.review.notes' | t }}</span>
          <textarea class="input" rows="3" maxlength="4000" [(ngModel)]="notes" [placeholder]="'devLevel.review.notesHint' | t"></textarea>
        </label>
        <div class="row-gap">
          <button type="button" class="btn btn-secondary btn-sm" [disabled]="saving()" (click)="save()">{{ 'common.save' | t }}</button>
          <a class="btn btn-ghost btn-sm" routerLink="/skills">{{ 'devLevel.review.seeLevel' | t }}</a>
        </div>
      }
    </section>
  `,
})
export class ProjectReviewComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  readonly projectId = input.required<number>();
  protected readonly data = createLoader(() => this.api.projectAssessment(this.projectId()), { immediate: false });
  protected readonly scores = signal<Record<string, number>>({});
  protected readonly saving = signal(false);
  protected notes = '';

  constructor() {
    effect(() => {
      this.projectId();
      untracked(() => void this.load());
    });
  }

  private async load(): Promise<void> {
    await this.data.reload();
    const a = this.data.value();
    this.scores.set({ ...(a?.scores ?? {}) });
    this.notes = a?.notes ?? '';
  }

  protected set(criterion: string, value: number): void { this.scores.update(s => ({ ...s, [criterion]: value })); }

  protected async save(): Promise<void> {
    this.saving.set(true);
    try {
      const saved = await this.api.saveProjectAssessment(this.projectId(), { scores: this.scores(), notes: this.notes.trim() || null });
      this.data.set(saved);
      this.toast.success(this.i18n.t('devLevel.review.saved'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }
}

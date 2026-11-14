import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/pipes';

/** The rubric: one 0–4 scale per criterion. Read-only when no change handler is wanted. */
@Component({
  selector: 'app-review-scale',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  styles: `
    .criteria { display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
    .criterion { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 0.86rem; }
    .scale { display: inline-flex; gap: 2px; }
    .scale button { min-width: 30px; padding: 4px 0; border: 1px solid var(--border); background: var(--surface-2); border-radius: var(--radius-xs); font-weight: 650; color: var(--text-2); }
    .scale button:not(:disabled) { cursor: pointer; }
    .scale button[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  `,
  template: `
    <div class="criteria">
      @for (c of criteria(); track c) {
        <div class="criterion">
          <span [id]="idPrefix() + c">{{ 'devLevel.review.criteria.' + c | t }}</span>
          <span class="scale" role="group" [attr.aria-labelledby]="idPrefix() + c">
            @for (v of [0, 1, 2, 3, 4]; track v) {
              <button type="button" [attr.aria-pressed]="scores()[c] === v" [disabled]="readonly()" (click)="changed.emit({ criterion: c, value: v })"
                      [attr.aria-label]="('devLevel.review.criteria.' + c | t) + ': ' + v + ' — ' + ('devLevel.review.scale.' + v | t)"
                      [title]="'devLevel.review.scale.' + v | t">{{ v }}</button>
            }
          </span>
        </div>
      }
    </div>
  `,
})
export class ReviewScaleComponent {
  readonly criteria = input.required<string[]>();
  readonly scores = input.required<Record<string, number>>();
  readonly readonly = input(false);
  readonly idPrefix = input('crit-');
  readonly changed = output<{ criterion: string; value: number }>();
}

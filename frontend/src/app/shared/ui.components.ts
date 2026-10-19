import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { ApiError } from '../core/api-error';
import { I18nService } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/pipes';
import { ConfirmService, ToastService } from '../core/ui-services';
import { IconComponent } from './icon.component';

/** Circular progress indicator with an accessible label. */
@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" role="img" [attr.aria-label]="label() || (rounded() + '%')" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.viewBox]="'0 0 ' + size() + ' ' + size()" aria-hidden="true">
        <circle class="ring-track" [attr.cx]="c()" [attr.cy]="c()" [attr.r]="r()" [attr.stroke-width]="stroke()" />
        <circle class="ring-value" [attr.cx]="c()" [attr.cy]="c()" [attr.r]="r()" [attr.stroke-width]="stroke()"
                [attr.stroke-dasharray]="circumference()" [attr.stroke-dashoffset]="offset()" />
      </svg>
      <span class="ring-text" [style.font-size.px]="size() / 4.4">{{ rounded() }}<small>%</small></span>
    </div>
  `,
})
export class ProgressRingComponent {
  readonly value = input.required<number>();
  readonly size = input(120);
  readonly stroke = input(10);
  readonly label = input('');
  protected readonly c = computed(() => this.size() / 2);
  protected readonly r = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.r());
  protected readonly offset = computed(() => this.circumference() * (1 - Math.min(100, Math.max(0, this.value())) / 100));
  protected readonly rounded = computed(() => Math.round(this.value()));
}

/** Horizontal progress bar (mirrors automatically in RTL thanks to logical CSS). */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" [class.bar-sm]="small()" role="progressbar" [attr.aria-valuenow]="clamped()" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="label()">
      <div class="bar-fill" [attr.data-tone]="tone()" [style.width.%]="clamped()"></div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly value = input.required<number>();
  readonly small = input(false);
  readonly tone = input<'accent' | 'success' | 'warning' | 'danger' | 'muted'>('accent');
  readonly label = input('');
  protected readonly clamped = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-busy': 'true' },
  template: `
    <span class="sr-only">{{ 'common.loading' | t }}</span>
    @for (row of rowsArray(); track $index) {
      <div class="skeleton" [style.height.px]="height()" [style.width.%]="$last && rows() > 1 ? 60 : 100"></div>
    }
  `,
  imports: [TranslatePipe],
})
export class SkeletonComponent {
  readonly rows = input(3);
  readonly height = input(18);
  protected readonly rowsArray = computed(() => Array.from({ length: this.rows() }));
}

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="empty-state">
      <div class="empty-icon"><app-icon [name]="icon()" [size]="26" /></div>
      <h3>{{ title() }}</h3>
      @if (message()) { <p>{{ message() }}</p> }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('sparkle');
  readonly title = input.required<string>();
  readonly message = input('');
}

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <div class="error-state" role="alert">
      <div class="empty-icon danger"><app-icon [name]="error()?.isOffline ? 'wifi' : 'alert'" [size]="24" /></div>
      <h3>{{ (error()?.status === 404 ? 'errors.notFound' : 'errors.title') | t }}</h3>
      <p>{{ message() }}</p>
      <button type="button" class="btn btn-secondary" (click)="retry.emit()">
        <app-icon name="refresh" [size]="16" /> {{ 'common.retry' | t }}
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  private readonly i18n = inject(I18nService);
  readonly error = input<ApiError | null>(null);
  readonly retry = output<void>();
  protected readonly message = computed(() => this.i18n.errorMessage(this.error()));
}

/** Confidence 0–5 as a radio group (keyboard accessible: arrow keys move between options). */
@Component({
  selector: 'app-confidence-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="confidence" role="radiogroup" [attr.aria-label]="'confidence.label' | t">
      @for (level of levels; track level) {
        <button type="button" role="radio" class="conf-dot" [attr.data-level]="level"
                [class.active]="value() !== null && level <= value()!" [attr.aria-checked]="value() === level"
                [disabled]="disabled()" [title]="'confidence.levels.' + level | t" (click)="changed.emit(level)">
          {{ level }}
        </button>
      }
      <span class="conf-label">{{ value() === null ? ('confidence.unrated' | t) : ('confidence.levels.' + value() | t) }}</span>
    </div>
  `,
})
export class ConfidencePickerComponent {
  readonly value = input<number | null>(null);
  readonly disabled = input(false);
  readonly changed = output<number>();
  protected readonly levels = [0, 1, 2, 3, 4, 5];
}

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div class="page-heading">
        @if (eyebrow()) { <p class="eyebrow">{{ eyebrow() }}</p> }
        <h1 id="page-title" tabindex="-1">{{ title() }}</h1>
        @if (subtitle()) { <p class="page-subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="page-actions"><ng-content /></div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly eyebrow = input('');
}

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [attr.data-kind]="toast.kind" role="status">
          <app-icon [name]="toast.kind === 'error' ? 'alert' : toast.kind === 'success' ? 'check-circle' : 'info'" [size]="18" />
          <span>{{ toast.text }}</span>
          <button type="button" class="icon-btn" (click)="toasts.dismiss(toast.id)" [attr.aria-label]="'common.close' | t">
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);
}

/** Accessible modal confirmation using the native <dialog> element (focus trap + Escape for free). */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <dialog #dialog class="dialog" (cancel)="$event.preventDefault(); confirm.answer(false)" aria-labelledby="confirm-title">
      @if (confirm.current(); as req) {
        <h2 id="confirm-title">{{ req.title || ('common.confirm' | t) }}</h2>
        <p>{{ req.message }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" (click)="confirm.answer(false)">{{ 'common.cancel' | t }}</button>
          <button type="button" class="btn" [class.btn-danger]="req.danger" [class.btn-primary]="!req.danger" (click)="confirm.answer(true)" autofocus>
            {{ req.confirmText || ('common.confirm' | t) }}
          </button>
        </div>
      }
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.confirm.current() && !el.open) el.showModal();
      if (!this.confirm.current() && el.open) el.close();
    });
  }
}

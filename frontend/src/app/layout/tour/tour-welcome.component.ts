import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, viewChild } from '@angular/core';
import { TourService } from '../../core/tour/tour.service';
import { IconComponent } from '../../shared/icon.component';

/**
 * Greets an account the first time it opens the app and offers the guided tour.
 * Skipping (or closing) is always possible and is remembered, so it appears only once.
 */
@Component({
  selector: 'app-tour-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <dialog #dialog class="dialog tour-welcome" (cancel)="$event.preventDefault(); dismiss()" aria-labelledby="tour-welcome-title"
            aria-describedby="tour-welcome-body">
      @if (tour.content(); as c) {
        <div class="tour-welcome-art" aria-hidden="true">
          <span class="brand-mark">
            <svg viewBox="0 0 32 32" width="44" height="44"><defs><linearGradient id="tw-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="var(--accent)" /><stop offset="1" stop-color="var(--accent-2)" /></linearGradient></defs>
              <rect width="32" height="32" rx="9" fill="url(#tw-bg)" />
              <path d="M9 21.5 14 16l-5-5.5M16.5 22h7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        <p class="eyebrow">{{ c.ui.welcomeEyebrow }}</p>
        <h2 id="tour-welcome-title">{{ c.ui.welcomeTitle }}</h2>
        <p id="tour-welcome-body" class="muted">{{ c.ui.welcomeBody }}</p>
        <ul class="tour-welcome-points" role="list">
          @for (point of c.ui.welcomePoints; track point) {
            <li><app-icon name="check-circle" [size]="17" /> <span>{{ point }}</span></li>
          }
        </ul>
        <p class="tour-welcome-length small muted"><app-icon name="clock" [size]="14" /> {{ c.ui.tourLength }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-ghost" (click)="skip()">{{ c.ui.skipIntro }}</button>
          <button type="button" class="btn btn-primary" (click)="start()" autofocus>
            <app-icon name="compass" [size]="16" /> {{ c.ui.startTour }}
          </button>
        </div>
      }
    </dialog>
  `,
})
export class TourWelcomeComponent {
  protected readonly tour = inject(TourService);
  /** Off on the sign-in style pages, where there is nothing to tour. */
  readonly enabled = input(true);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      const open = this.enabled() && this.tour.showWelcome();
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    });
  }

  protected start(): void {
    // A modal dialog sits above everything, so it must be closed before the tour draws its overlay.
    this.dialog().nativeElement.close();
    void this.tour.startTour();
  }

  protected skip(): void {
    this.dialog().nativeElement.close();
    this.tour.dismissWelcome('skipped');
  }

  protected dismiss(): void {
    this.dialog().nativeElement.close();
    this.tour.dismissWelcome('dismissed');
  }
}

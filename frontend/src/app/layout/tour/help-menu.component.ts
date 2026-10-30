import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { PAGE_HELP, SectionId } from '../../core/tour/tour.config';
import { TourService } from '../../core/tour/tour.service';
import { IconComponent } from '../../shared/icon.component';

/**
 * The always-available Help button: continue or restart the tour, walk through the current page,
 * pick any section to explain, or open quick help (also on the ? key). Works the same whether the
 * first-run tour was completed, skipped or never finished. The shell places one in the top bar and a
 * floating one for phones (the top bar has no room left there); CSS shows one or the other.
 */
@Component({
  selector: 'app-help-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { class: 'menu-wrap help-wrap', '[class.help-floating]': 'floating()' },
  template: `
    <button type="button" class="icon-btn help-btn" data-tour="help" (click)="toggle()" aria-haspopup="menu" [attr.aria-expanded]="open()"
            [attr.aria-label]="label()" [title]="label()">
      <app-icon name="help" />
    </button>
    @if (open()) {
      <div class="menu help-menu" role="menu">
        @if (tour.content(); as c) {
          <p class="menu-label">{{ c.ui.helpMenu }}</p>
          @if (tour.canResume()) {
            <button type="button" role="menuitem" (click)="resume()">
              <app-icon name="play" [size]="17" />
              <span><strong>{{ c.ui.continueTour }}</strong>
                <small>{{ tour.format(c.ui.continueHint, { n: tour.progress().step + 1, total: tour.tourLength() }) }}</small></span>
            </button>
          }
          <button type="button" role="menuitem" (click)="explore()">
            <app-icon name="compass" [size]="17" />
            <span><strong>{{ c.ui.explore }}</strong><small>{{ c.ui.exploreHint }}</small></span>
          </button>
          @if (pageTitle(); as page) {
            <button type="button" role="menuitem" (click)="thisPage()">
              <app-icon name="book" [size]="17" />
              <span><strong>{{ c.ui.thisPage }}</strong><small>{{ tour.format(c.ui.thisPageHint, { page }) }}</small></span>
            </button>
          }
          <button type="button" role="menuitem" (click)="pick()">
            <app-icon name="pointer" [size]="17" />
            <span><strong>{{ c.ui.pick }}</strong><small>{{ c.ui.pickHint }}</small></span>
          </button>
          <button type="button" role="menuitem" (click)="openQuick()">
            <app-icon name="info" [size]="17" />
            <span><strong>{{ c.ui.quick }}</strong><small>{{ c.ui.quickHint }}</small></span>
          </button>
        } @else {
          <p class="menu-label"><app-icon name="refresh" class="spin" [size]="14" /></p>
        }
      </div>
    }

    <dialog #quick class="dialog dialog-wide quick-help" (cancel)="$event.preventDefault(); closeQuick()" aria-labelledby="quick-help-title">
      @if (quickOpen() && tour.content(); as c) {
        <div class="quick-help-head">
          <h2 id="quick-help-title">{{ tour.format(c.ui.quickTitle, { page: pageTitle() ?? c.ui.helpMenu }) }}</h2>
          <button type="button" class="icon-btn" (click)="closeQuick()" [attr.aria-label]="c.ui.close"><app-icon name="x" /></button>
        </div>
        @if (tour.helpId(); as helpId) {
          <p class="muted">{{ c.pages[helpId].summary }}</p>
          <h3 class="quick-help-sub">{{ c.ui.sectionsTitle }}</h3>
          <ul class="quick-help-sections" role="list">
            @for (id of sections(); track id) {
              <li>
                <div class="grow">
                  <strong>{{ c.sections[id].title }}</strong>
                  <p class="small muted">{{ c.sections[id].body }}</p>
                </div>
                <button type="button" class="btn btn-ghost btn-sm" (click)="showMe(id)">{{ c.ui.showMe }}</button>
              </li>
            }
          </ul>
        } @else {
          <p class="muted">{{ c.ui.noPageHelp }}</p>
        }
        <h3 class="quick-help-sub">{{ c.ui.tipsTitle }}</h3>
        <ul class="quick-help-tips" role="list">
          @for (tip of c.tips; track tip) { <li><app-icon name="bulb" [size]="15" /> <span>{{ tip }}</span></li> }
        </ul>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" (click)="explore()"><app-icon name="compass" [size]="16" /> {{ c.ui.explore }}</button>
          @if (tour.helpId()) {
            <button type="button" class="btn btn-primary" (click)="thisPage()" autofocus><app-icon name="book" [size]="16" /> {{ c.ui.pageTour }}</button>
          }
        </div>
      }
    </dialog>
  `,
})
export class HelpMenuComponent {
  protected readonly tour = inject(TourService);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** The round button in the corner on small screens. */
  readonly floating = input(false);
  private readonly quick = viewChild.required<ElementRef<HTMLDialogElement>>('quick');

  protected readonly open = signal(false);
  protected readonly quickOpen = signal(false);
  protected readonly pageTitle = computed(() => this.tour.pageTitle());
  protected readonly sections = computed(() => {
    const id = this.tour.helpId();
    return id ? PAGE_HELP[id] : [];
  });
  protected readonly label = computed(() => this.tour.content()?.ui.helpButton ?? 'Help');

  constructor() {
    effect(() => {
      const el = this.quick().nativeElement;
      if (this.quickOpen() && !el.open) el.showModal();
      if (!this.quickOpen() && el.open) el.close();
    });
  }

  protected toggle(): void {
    this.open.set(!this.open());
    if (this.open()) void this.tour.ensureContent();
  }

  protected resume(): void { this.open.set(false); void this.tour.resumeTour(); }
  protected explore(): void { this.closeAll(); void this.tour.startTour(); }
  protected thisPage(): void { this.closeAll(); void this.tour.startPage(); }
  protected pick(): void { this.open.set(false); void this.tour.startPicking(); }

  protected async openQuick(): Promise<void> {
    this.open.set(false);
    await this.tour.ensureContent();
    this.tour.close();
    this.tour.stopPicking();
    this.quickOpen.set(true);
  }

  protected closeQuick(): void { this.quickOpen.set(false); }

  protected showMe(id: SectionId): void {
    this.closeAll();
    void this.tour.startPage(this.tour.helpId(), id);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) this.open.set(false);
    // Two instances exist (top bar and floating); only the one on screen answers the shortcut.
    if (getComputedStyle(this.host.nativeElement).display === 'none') return;
    const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]');
    // "?" opens quick help for the current page (unless typing, or a tour is already showing).
    if (event.key === '?' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey && !this.tour.run() && !this.quickOpen()) {
      event.preventDefault();
      void this.openQuick();
    }
  }

  /** Dialogs sit in the top layer, above the tour, so they close before a tour starts. */
  private closeAll(): void {
    this.open.set(false);
    this.quickOpen.set(false);
  }
}

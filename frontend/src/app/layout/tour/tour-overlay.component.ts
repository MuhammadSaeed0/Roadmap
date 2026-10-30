import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, WritableSignal, computed, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TourText } from '../../core/tour/tour-content';
import { RuntimeStep, TourService } from '../../core/tour/tour.service';
import { isSectionId, SectionId, tourSelector } from '../../core/tour/tour.config';
import { IconComponent } from '../../shared/icon.component';

interface Box { top: number; left: number; width: number; height: number; }

const PADDING = 6;        // space between the element and the highlight ring
const MARGIN = 12;        // closest the card gets to the viewport edge
const GAP = 14;           // space between the highlight and the card
const WAIT_MS = 6000;     // how long to wait for a step's element before showing the card without a highlight
const FALLBACK_AFTER_MS = 3000;  // how long the preferred element gets before a fallback is accepted
const LATE_MS = 20000;    // keeps looking after that, and highlights the element if it shows up (slow data, first page load)

/**
 * Draws the tour: a dimmed page with a cut-out around the explained element, and a card next to it
 * that is kept inside the viewport. Also runs "explore a specific section" (pick mode), where any
 * explainable element is outlined on hover and opens its explanation when clicked.
 * Rendered once at the root of the shell, outside the top bar and sidebar, whose transforms and
 * backdrop filters would otherwise break `position: fixed`.
 */
@Component({
  selector: 'app-tour-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (tour.run(); as run) {
      @if (tour.content(); as c) {
        @let step = run.steps[run.index];
        @let text = fallbackText() ?? step.text;
        @let last = run.index === run.steps.length - 1;
        <div class="tour-blocker" [class.tour-dim]="!spot()" aria-hidden="true"></div>
        @if (spot(); as s) {
          <div class="tour-spotlight" aria-hidden="true"
               [style.top.px]="s.top" [style.left.px]="s.left" [style.width.px]="s.width" [style.height.px]="s.height"></div>
        }
        <section #card class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-card-title" aria-describedby="tour-card-body"
                 [class.ready]="ready()" [class.centered]="!spot()" [style.top.px]="cardPos()?.top" [style.left.px]="cardPos()?.left"
                 (keydown)="trapFocus($event)">
          <header class="tour-card-head">
            <span class="tour-step-count">
              @if (run.steps.length > 1) {
                {{ tour.format(c.ui.stepOf, { n: run.index + 1, total: run.steps.length }) }}
              } @else {
                <app-icon name="pointer" [size]="13" /> {{ tour.pageTitle() ?? c.ui.helpMenu }}
              }
            </span>
            <button type="button" class="icon-btn tour-close" (click)="tour.close()" [attr.aria-label]="c.ui.close" [title]="c.ui.close">
              <app-icon name="x" [size]="16" />
            </button>
          </header>
          <h2 #title id="tour-card-title" class="tour-card-title" tabindex="-1">{{ text.title }}</h2>
          <p id="tour-card-body" class="tour-card-body">{{ text.body }}</p>
          @if (missing()) { <p class="tour-note"><app-icon name="info" [size]="14" /> {{ c.ui.notOnScreen }}</p> }
          @if (run.steps.length > 1) {
            <div class="tour-progress" aria-hidden="true"><span [style.width.%]="((run.index + 1) / run.steps.length) * 100"></span></div>
          }
          <footer class="tour-actions">
            @if (run.kind === 'tour') {
              <button type="button" class="btn btn-ghost btn-sm" (click)="tour.skip()">{{ c.ui.skip }}</button>
            } @else if (run.kind === 'section') {
              <button type="button" class="btn btn-ghost btn-sm" (click)="tour.startPicking()">{{ c.ui.pickAnother }}</button>
            }
            <span class="grow"></span>
            @if (run.index > 0) {
              <button type="button" class="btn btn-secondary btn-sm" (click)="tour.back()">
                <app-icon name="chevron-left" [size]="15" class="flip-rtl" /> {{ c.ui.back }}
              </button>
            }
            <button type="button" class="btn btn-primary btn-sm" (click)="tour.next()">
              {{ last ? c.ui.done : c.ui.next }} @if (!last) { <app-icon name="chevron-right" [size]="15" class="flip-rtl" /> }
            </button>
          </footer>
        </section>
      }
    }

    @if (tour.picking() && tour.content(); as c) {
      <div class="tour-pick-layer" (pointermove)="onPickMove($event)" (click)="onPick($event)" aria-hidden="true"></div>
      @if (hover(); as h) {
        <div class="tour-pick-outline" aria-hidden="true"
             [style.top.px]="h.top" [style.left.px]="h.left" [style.width.px]="h.width" [style.height.px]="h.height">
          @if (hoverTitle(); as t) { <span class="tour-pick-label">{{ t }}</span> }
        </div>
      }
      <div class="tour-pick-banner" role="status">
        <app-icon name="pointer" [size]="16" />
        <span>{{ c.ui.pickBanner }}</span>
        <button type="button" class="btn btn-secondary btn-sm" (click)="tour.stopPicking()">{{ c.ui.pickStop }}</button>
      </div>
    }
  `,
})
export class TourOverlayComponent {
  protected readonly tour = inject(TourService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly card = viewChild<ElementRef<HTMLElement>>('card');
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  protected readonly spot = signal<Box | null>(null);
  protected readonly cardPos = signal<{ top: number; left: number } | null>(null);
  protected readonly ready = signal(false);
  protected readonly missing = signal(false);
  /** When a step falls back to another element (the menu button instead of the off-canvas sidebar), that element's text. */
  protected readonly fallbackText = signal<TourText | null>(null);
  protected readonly hover = signal<Box | null>(null);
  private readonly hoverId = signal<SectionId | null>(null);
  protected readonly hoverTitle = computed(() => {
    const id = this.hoverId();
    return id ? this.tour.sectionText(id)?.title ?? null : null;
  });

  private target: HTMLElement | null = null;
  private hoverEl: HTMLElement | null = null;
  private frame = 0;
  private token = 0;
  private returnFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const step = this.tour.current();
      untracked(() => void this.show(step));
    });
    // Follows the element while the page scrolls, resizes or re-renders (one cheap measure per frame).
    effect(() => {
      const active = !!this.tour.run() || this.tour.picking();
      untracked(() => (active ? this.startLoop() : this.stopLoop()));
    });
    inject(DestroyRef).onDestroy(() => this.stopLoop());
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.tour.picking() && event.key === 'Escape') {
      event.preventDefault();
      this.tour.stopPicking();
      return;
    }
    if (!this.tour.run()) return;
    const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]');
    const rtl = this.document.documentElement.dir === 'rtl';
    if (event.key === 'Escape') {
      event.preventDefault();
      this.tour.close();
    } else if (!typing && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const forward = (event.key === 'ArrowRight') !== rtl;
      if (forward) this.tour.next(); else this.tour.back();
    }
  }

  /** Keeps keyboard focus inside the card while a step is shown (the page behind is inert). */
  protected trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const items = Array.from(this.card()?.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []);
    if (items.length === 0) return;
    const first = items[0], lastItem = items[items.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && (active === first || !items.includes(active as HTMLElement))) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && active === lastItem) {
      event.preventDefault();
      first.focus();
    }
  }

  protected onPickMove(event: PointerEvent): void {
    this.setHover(this.sectionAt(event.clientX, event.clientY));
  }

  protected onPick(event: MouseEvent): void {
    const el = this.sectionAt(event.clientX, event.clientY);
    const id = el?.getAttribute('data-tour');
    if (el && isSectionId(id)) {
      this.setHover(null);
      void this.tour.explainSection(id);
    }
  }

  private async show(step: RuntimeStep | null): Promise<void> {
    const token = ++this.token;
    if (!step) {
      this.target = null;
      this.spot.set(null);
      this.ready.set(false);
      this.restoreFocus();
      return;
    }
    if (!this.returnFocus) this.returnFocus = this.document.activeElement as HTMLElement | null;
    this.ready.set(false);
    this.missing.set(false);
    this.fallbackText.set(null);
    if (step.route && this.path() !== step.route) {
      await this.router.navigateByUrl(step.route);
      if (token !== this.token) return;
    }
    const el = step.targets.length > 0 ? await this.waitFor(step.targets, token, WAIT_MS) : null;
    if (token !== this.token) return;
    this.attach(el, step);
    this.missing.set(step.targets.length > 0 && !el);
    this.ready.set(true);
    setTimeout(() => this.title()?.nativeElement.focus({ preventScroll: true }));
    if (step.targets.length > 0 && !el) {
      const late = await this.waitFor(step.targets, token, LATE_MS);
      if (late && token === this.token) {
        this.attach(late, step);
        this.missing.set(false);
      }
    }
  }

  private attach(el: HTMLElement | null, step: RuntimeStep): void {
    this.target = el;
    const id = el?.getAttribute('data-tour');
    this.fallbackText.set(isSectionId(id) && id !== step.targets[0] ? this.tour.sectionText(id) : null);
    if (el) {
      const smooth = !this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    }
    this.measure();
  }

  /**
   * The step's preferred element once it is on screen. A fallback (a later id) is used straight away when the
   * preferred element exists but is hidden (the off-canvas mobile sidebar, say), and otherwise only after a short
   * wait, so a section whose data is still loading isn't swapped for a lesser one.
   */
  private waitFor(ids: readonly SectionId[], token: number, timeout: number): Promise<HTMLElement | null> {
    const started = Date.now();
    return new Promise(resolve => {
      const check = () => {
        if (token !== this.token) return resolve(null);
        for (const [i, id] of ids.entries()) {
          const all = Array.from(this.document.querySelectorAll<HTMLElement>(tourSelector(id)));
          const match = all.find(el => this.isShown(el));
          if (match) return resolve(match);
          const preferredHidden = i === 0 && all.length > 0;
          if (!preferredHidden && Date.now() - started < FALLBACK_AFTER_MS) break;
        }
        if (Date.now() - started > timeout) return resolve(null);
        setTimeout(check, 150);
      };
      check();
    });
  }

  /**
   * Rendered and mostly inside the viewport horizontally. An off-canvas panel (the mobile sidebar) can overlap the
   * edge by a few pixels, and scrolling "to" it would shift the whole page sideways, so half of it must be in view.
   */
  private isShown(el: HTMLElement): boolean {
    const r = el.getBoundingClientRect();
    const view = this.document.defaultView!;
    if (r.width <= 0 || r.height <= 0 || view.getComputedStyle(el).visibility === 'hidden') return false;
    const visibleWidth = Math.min(r.right, view.innerWidth) - Math.max(r.left, 0);
    return visibleWidth >= Math.min(r.width, view.innerWidth) / 2;
  }

  private sectionAt(x: number, y: number): HTMLElement | null {
    for (const el of this.document.elementsFromPoint(x, y)) {
      if (this.host.nativeElement.contains(el)) continue;
      const section = (el as HTMLElement).closest<HTMLElement>('[data-tour]');
      if (section && isSectionId(section.getAttribute('data-tour'))) return section;
    }
    return null;
  }

  private setHover(el: HTMLElement | null): void {
    this.hoverEl = el;
    const id = el?.getAttribute('data-tour');
    this.hoverId.set(isSectionId(id) ? id : null);
    if (!el) this.hover.set(null);
  }

  private startLoop(): void {
    if (this.frame) return;
    const tick = () => {
      this.measure();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.setHover(null);
  }

  /** Positions the highlight and the card. Writes signals only when something moved. */
  private measure(): void {
    const view = this.document.defaultView!;
    const vw = view.innerWidth, vh = view.innerHeight;

    if (this.hoverEl) this.setBox(this.hover, this.boxOf(this.hoverEl, vw, vh));

    const box = this.target?.isConnected ? this.boxOf(this.target, vw, vh) : null;
    this.setBox(this.spot, box);

    const card = this.card()?.nativeElement;
    if (!card) return;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let top: number, left: number;
    if (!box) {
      top = (vh - ch) / 2;
      left = (vw - cw) / 2;
    } else {
      const below = box.top + box.height + GAP;
      const above = box.top - GAP - ch;
      if (below + ch <= vh - MARGIN) top = below;
      else if (above >= MARGIN) top = above;
      else top = vh - ch - MARGIN;  // the element fills the screen: sit at the bottom, over it
      left = box.left + box.width / 2 - cw / 2;
    }
    top = Math.round(Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - ch - MARGIN)));
    left = Math.round(Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - cw - MARGIN)));
    const pos = this.cardPos();
    if (!pos || pos.top !== top || pos.left !== left) this.cardPos.set({ top, left });
  }

  /** The element's box plus padding, clipped to the viewport so a tall section still shows a sensible ring. */
  private boxOf(el: HTMLElement, vw: number, vh: number): Box {
    const r = el.getBoundingClientRect();
    const top = Math.max(r.top - PADDING, 4), left = Math.max(r.left - PADDING, 4);
    const bottom = Math.min(r.bottom + PADDING, vh - 4), right = Math.min(r.right + PADDING, vw - 4);
    return { top: Math.round(top), left: Math.round(left), width: Math.round(Math.max(0, right - left)), height: Math.round(Math.max(0, bottom - top)) };
  }

  private setBox(target: WritableSignal<Box | null>, box: Box | null): void {
    const old = target();
    if (old === box) return;
    if (old && box && old.top === box.top && old.left === box.left && old.width === box.width && old.height === box.height) return;
    target.set(box);
  }

  private path(): string {
    return this.router.url.split(/[?#]/)[0] || '/';
  }

  private restoreFocus(): void {
    const el = this.returnFocus;
    this.returnFocus = null;
    if (el?.isConnected && !this.tour.picking()) el.focus({ preventScroll: true });
  }
}

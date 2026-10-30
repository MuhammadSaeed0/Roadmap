import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../auth.service';
import { I18nService } from '../i18n/i18n.service';
import { ToastService } from '../ui-services';
import { TourContent, TourText } from './tour-content';
import { HelpId, MAIN_TOUR, PAGE_HELP, SectionId, TourContext, tourSelector } from './tour.config';

/**
 * Where an account is with the first-run tour:
 * new (never seen the welcome), paused (closed part-way; Help offers to continue),
 * completed, skipped (from the welcome or the tour), dismissed (closed the welcome).
 */
export type TourStatus = 'new' | 'paused' | 'completed' | 'skipped' | 'dismissed';
export interface TourProgress { status: TourStatus; step: number; }

/** A step ready to show: the element(s) to highlight, the page it lives on, and its text. */
export interface RuntimeStep { key: string; route?: string; targets: readonly SectionId[]; text: TourText; }

/** What is on screen: the first-run tour, a page walk-through, or one picked section. */
export interface TourRun { kind: 'tour' | 'page' | 'section'; steps: RuntimeStep[]; index: number; }

const STORAGE_PREFIX = 'devpath.tour.v1.';
const NEW: TourProgress = { status: 'new', step: 0 };

/**
 * State for the onboarding tour and the help menu. The texts load on demand (one small chunk per
 * language). Progress is per account and per browser (localStorage): it only decides whether to
 * greet someone, so it doesn't need a database column, and a new device simply offers the tour again.
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  readonly content = signal<TourContent | null>(null);
  /** The current page's guide, from the route's `data.helpId` (set by the shell). */
  readonly helpId = signal<HelpId | null>(null);
  readonly run = signal<TourRun | null>(null);
  readonly picking = signal(false);
  readonly progress = signal<TourProgress>(NEW);

  readonly current = computed(() => {
    const run = this.run();
    return run ? run.steps[run.index] ?? null : null;
  });
  /** First visit of an approved account: greet it (never forced; the app stays usable). */
  readonly showWelcome = computed(() =>
    this.auth.approved() && this.progress().status === 'new' && !this.run() && !this.picking() && !!this.content());
  readonly canResume = computed(() => this.progress().status === 'paused');
  readonly tourLength = computed(() => this.mainDefs().length);

  private loadedLang: string | null = null;
  private loading: Promise<TourContent> | null = null;

  constructor() {
    // Each account has its own progress; switching accounts in the same browser re-reads it.
    effect(() => {
      const id = this.auth.account()?.id ?? null;
      untracked(() => this.progress.set(id ? read(this.storageKey(id)) : NEW));
    });
    // New accounts need the welcome text right away; for everyone else it loads when Help is opened.
    effect(() => {
      const lang = this.i18n.lang();
      const wanted = this.loadedLang !== null || (this.auth.approved() && this.progress().status === 'new');
      if (wanted && lang !== this.loadedLang) untracked(() => void this.ensureContent());
    });
  }

  /** Loads the texts for the current language (cached per language). */
  async ensureContent(): Promise<TourContent> {
    const lang = this.i18n.lang();
    if (this.content() && this.loadedLang === lang) return this.content()!;
    this.loading = (lang === 'ar' ? import('./tour-content.ar') : import('./tour-content.en')).then(m => {
      if (this.i18n.lang() === lang) {
        this.loadedLang = lang;
        this.content.set(m.content);
      }
      return m.content;
    });
    return this.loading;
  }

  /** "{n} of {total}" style text with its placeholders filled in. */
  format(text: string, params: Record<string, string | number> = {}): string {
    return text.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
  }

  pageTitle(helpId = this.helpId()): string | null {
    return helpId ? this.content()?.pages[helpId].title ?? null : null;
  }

  sectionText(id: SectionId): TourText | null {
    return this.content()?.sections[id] ?? null;
  }

  // ----- First-run tour -----

  async startTour(from = 0): Promise<void> {
    const content = await this.ensureContent();
    const steps = this.mainDefs().map(def => ({
      key: def.id,
      route: def.route,
      targets: def.targets ?? [],
      text: def.id === 'welcome' || def.id === 'finish' ? content.steps[def.id] : content.sections[def.id],
    }));
    const index = Math.min(Math.max(0, from), steps.length - 1);
    this.picking.set(false);
    this.run.set({ kind: 'tour', steps, index });
    this.save({ status: 'paused', step: index });
  }

  resumeTour(): Promise<void> {
    return this.startTour(this.progress().step);
  }

  /** Closing the welcome without choosing counts as "seen": it isn't shown again. */
  dismissWelcome(status: 'skipped' | 'dismissed'): void {
    this.save({ status, step: 0 });
    if (status === 'skipped') void this.ensureContent().then(c => this.toast.info(c.ui.tourSkipped));
  }

  // ----- Page guides -----

  /** Walks through the parts of a page that are on screen now, optionally starting at one of them. */
  async startPage(helpId = this.helpId(), start?: SectionId): Promise<void> {
    if (!helpId) return;
    const content = await this.ensureContent();
    const all = PAGE_HELP[helpId];
    const present = all.filter(id => !!this.document.querySelector(tourSelector(id)));
    const ids = present.length > 0 ? present : all;
    const steps = ids.map(id => ({ key: id, targets: [id], text: content.sections[id] }));
    const index = start ? Math.max(0, ids.indexOf(start)) : 0;
    this.picking.set(false);
    this.run.set({ kind: 'page', steps, index });
  }

  /** Explains one element (from "Explore a specific section"). */
  async explainSection(id: SectionId): Promise<void> {
    const content = await this.ensureContent();
    this.picking.set(false);
    this.run.set({ kind: 'section', steps: [{ key: id, targets: [id], text: content.sections[id] }], index: 0 });
  }

  async startPicking(): Promise<void> {
    await this.ensureContent();
    this.run.set(null);
    this.picking.set(true);
  }

  stopPicking(): void {
    this.picking.set(false);
  }

  // ----- Navigation within a run -----

  next(): void {
    const run = this.run();
    if (!run) return;
    if (run.index >= run.steps.length - 1) {
      this.finish();
      return;
    }
    this.go(run, run.index + 1);
  }

  back(): void {
    const run = this.run();
    if (run && run.index > 0) this.go(run, run.index - 1);
  }

  /** Leaves the first-run tour for good (Help can still restart it). */
  skip(): void {
    const run = this.run();
    this.run.set(null);
    if (run?.kind === 'tour') {
      this.save({ status: 'skipped', step: 0 });
      const text = this.content()?.ui.tourSkipped;
      if (text) this.toast.info(text);
    }
  }

  /** Closes for now: the first-run tour remembers its step, so Help can continue it. */
  close(): void {
    this.run.set(null);
  }

  /** Ends a page guide or picked section when the person navigates elsewhere. */
  endIfNotTour(): void {
    if (this.run()?.kind !== 'tour') this.run.set(null);
    this.picking.set(false);
  }

  private finish(): void {
    const run = this.run();
    this.run.set(null);
    if (run?.kind === 'tour') {
      this.save({ status: 'completed', step: 0 });
      const text = this.content()?.ui.tourDone;
      if (text) this.toast.success(text);
    }
  }

  private go(run: TourRun, index: number): void {
    this.run.set({ ...run, index });
    if (run.kind === 'tour') this.save({ status: 'paused', step: index });
  }

  private mainDefs() {
    const ctx: TourContext = { isAdmin: this.auth.isAdmin() };
    return MAIN_TOUR.filter(step => !step.when || step.when(ctx));
  }

  private storageKey(accountId: string): string {
    return STORAGE_PREFIX + accountId;
  }

  private save(progress: TourProgress): void {
    this.progress.set(progress);
    const id = this.auth.account()?.id;
    if (!id) return;
    try { localStorage.setItem(this.storageKey(id), JSON.stringify(progress)); } catch { /* not remembered */ }
  }
}

function read(key: string): TourProgress {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<TourProgress> | null;
    const statuses: TourStatus[] = ['new', 'paused', 'completed', 'skipped', 'dismissed'];
    if (value && statuses.includes(value.status as TourStatus))
      return { status: value.status as TourStatus, step: Number.isInteger(value.step) ? value.step! : 0 };
  } catch { /* unreadable: start fresh */ }
  return NEW;
}

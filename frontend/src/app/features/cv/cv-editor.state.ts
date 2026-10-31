import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Cv, CvApiService, CvContent, CvPreview, CvSectionKey, CvStyle, CvSummary, CvTemplate } from './cv-api.service';
import { cvErrorMessage } from './cv-strings';

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

/**
 * The CV open in the editor, shared by the editor's panels. Every change marks it dirty; it is saved
 * shortly after the user stops typing, and the preview is re-rendered from what is on screen.
 */
@Injectable()
export class CvEditorState {
  private readonly api = inject(CvApiService);
  private readonly i18n = inject(I18nService);

  readonly templates = signal<CvTemplate[]>([]);
  readonly summary = signal<CvSummary | null>(null);
  readonly title = signal('');
  readonly templateKey = signal('modern');
  readonly content = signal<CvContent | null>(null);
  readonly style = signal<CvStyle | null>(null);
  /** Increases on every edit; saving and the preview follow it. */
  readonly revision = signal(0);

  readonly saveState = signal<SaveState>('saved');
  readonly saveError = signal('');
  readonly preview = signal<CvPreview | null>(null);
  readonly previewLoading = signal(false);
  readonly previewError = signal(false);
  /** Shared between the "Job match" and "ATS check" panels. */
  readonly jobDescription = signal('');

  readonly template = computed(() => this.templates().find(t => t.key === this.templateKey()) ?? null);
  readonly id = computed(() => this.summary()?.id ?? 0);

  private savedRevision = 0;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private previewTimer: ReturnType<typeof setTimeout> | undefined;
  private saving: Promise<void> | null = null;
  private previewRequest = 0;

  constructor() {
    effect(() => {
      const revision = this.revision();
      if (!this.content()) return;
      untracked(() => {
        clearTimeout(this.previewTimer);
        this.previewTimer = setTimeout(() => void this.refreshPreview(), revision === 0 ? 0 : 600);
        if (revision > this.savedRevision) {
          this.saveState.set('dirty');
          clearTimeout(this.saveTimer);
          this.saveTimer = setTimeout(() => void this.save(), 1200);
        }
      });
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.previewTimer);
      if (this.revision() > this.savedRevision) void this.save();   // keep the last edits when leaving the page
    });
  }

  load(cv: Cv, templates: CvTemplate[]): void {
    this.templates.set(templates);
    this.summary.set(cv.summary);
    this.title.set(cv.summary.title);
    this.templateKey.set(cv.summary.templateKey);
    this.content.set(cv.content);
    this.style.set(cv.style);
    this.preview.set(null);
    this.savedRevision = 0;
    this.revision.set(0);
    this.saveState.set('saved');
  }

  // ---------------------------------------------------------------- edits

  edit(change: (c: CvContent) => CvContent): void {
    this.content.update(c => (c ? change(c) : c));
    this.revision.update(r => r + 1);
  }

  setStyle(patch: Partial<CvStyle>): void {
    this.style.update(s => (s ? { ...s, ...patch } : s));
    this.revision.update(r => r + 1);
  }

  setTitle(title: string): void {
    this.title.set(title);
    this.revision.update(r => r + 1);
  }

  /** Switches the layout; the content stays. The colour and font follow the new template unless the user changed them. */
  setTemplate(key: string): void {
    const next = this.templates().find(t => t.key === key);
    const previous = this.template();
    const style = this.style();
    if (!next || !style) return;
    const keptAccent = previous && style.accent.toLowerCase() !== previous.defaultAccent.toLowerCase() && next.supportsColor;
    const keptFont = previous && style.font !== previous.defaultFont;
    this.templateKey.set(key);
    this.setStyle({
      accent: keptAccent ? style.accent : next.defaultAccent,
      font: (keptFont ? style.font : next.defaultFont) as CvStyle['font'],
      showPhoto: next.supportsPhoto && (style.showPhoto || !previous?.supportsPhoto),
    });
  }

  moveSection(key: CvSectionKey, delta: number): void {
    const order = [...this.style()!.sectionOrder];
    const i = order.indexOf(key), j = i + delta;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    this.setStyle({ sectionOrder: order });
  }

  toggleSection(key: CvSectionKey): void {
    const hidden = this.style()!.hidden;
    this.setStyle({ hidden: hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key] });
  }

  // ---------------------------------------------------------------- saving and preview

  /** Saves now if there are unsaved edits (used before downloads and AI requests, which read the saved CV). */
  async flush(): Promise<boolean> {
    clearTimeout(this.saveTimer);
    if (this.saving) await this.saving;
    if (this.revision() > this.savedRevision) await this.save();
    return this.saveState() === 'saved';
  }

  async save(): Promise<void> {
    if (this.saving) { await this.saving; if (this.revision() <= this.savedRevision) return; }
    const content = this.content(), style = this.style(), id = this.id();
    if (!content || !style || !id) return;
    const revision = this.revision();
    this.saveState.set('saving');
    this.saving = (async () => {
      try {
        const saved = await this.api.update(id, { title: this.title().trim() || 'CV', templateKey: this.templateKey(), content, style });
        this.savedRevision = Math.max(this.savedRevision, revision);
        this.summary.set(saved.summary);
        this.saveError.set('');
        this.saveState.set(this.revision() > this.savedRevision ? 'dirty' : 'saved');
      } catch (e) {
        this.saveError.set(cvErrorMessage(this.i18n, e));
        this.saveState.set('error');
      } finally {
        this.saving = null;
      }
    })();
    await this.saving;
    if (this.saveState() === 'dirty') { clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => void this.save(), 1200); }
  }

  async refreshPreview(): Promise<void> {
    const content = this.content(), style = this.style(), id = this.id();
    if (!content || !style || !id) return;
    const request = ++this.previewRequest;
    this.previewLoading.set(true);
    try {
      const preview = await this.api.preview(id, { templateKey: this.templateKey(), content, style });
      if (request !== this.previewRequest) return;
      this.preview.set(preview);
      this.previewError.set(false);
    } catch {
      if (request === this.previewRequest) this.previewError.set(true);
    } finally {
      if (request === this.previewRequest) this.previewLoading.set(false);
    }
  }

  /** The photo changed on the server: show it in the preview. */
  photoChanged(summary: CvSummary): void {
    this.summary.set(summary);
    void this.refreshPreview();
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { CvApiService } from './cv-api.service';
import { CvAtsComponent } from './cv-ats.component';
import { CONTENT_STEPS, ContentStep, CvContentComponent } from './cv-content.component';
import { CvDesignComponent } from './cv-design.component';
import { CvEditorState } from './cv-editor.state';
import { CvJobComponent } from './cv-job.component';
import { CvSuggestionsComponent } from './cv-suggestions.component';
import { useCvErrors } from './cv-strings';

type Panel = 'content' | 'design' | 'suggestions' | 'job' | 'ats';
const PANELS: { key: Panel; icon: string }[] = [
  { key: 'content', icon: 'edit' }, { key: 'design', icon: 'format' }, { key: 'suggestions', icon: 'award' },
  { key: 'job', icon: 'target' }, { key: 'ats', icon: 'check-circle' },
];
const ZOOMS = [50, 65, 80, 100, 125, 150];

/** Edit one CV beside a live preview of the real PDF layout. Changes are saved automatically. */
@Component({
  selector: 'app-cv-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CvEditorState],
  imports: [RouterLink, IconComponent, TranslatePipe, SkeletonComponent, ErrorStateComponent, CvContentComponent, CvDesignComponent,
    CvSuggestionsComponent, CvJobComponent, CvAtsComponent],
  template: `
    @if (loadError()) {
      <app-error-state [error]="loadError()" (retry)="load()" />
    } @else if (!state.content()) {
      <div class="card"><app-skeleton [rows]="6" /></div>
    } @else {
      <header class="cv-head">
        <a routerLink="/cv" class="btn btn-ghost btn-sm"><app-icon name="chevron-left" [size]="15" /> {{ 'cv.editor.back' | t }}</a>
        <label class="visually-hidden" for="cv-title">{{ 'cv.editor.titleLabel' | t }}</label>
        <input id="cv-title" class="input cv-title" maxlength="100" [value]="state.title()" (input)="state.setTitle(val($event))" />
        <span class="cv-save small" [attr.data-state]="state.saveState()" role="status">
          @switch (state.saveState()) {
            @case ('saved') { <app-icon name="check" [size]="13" /> {{ 'cv.editor.saved' | t }} }
            @case ('saving') { {{ 'cv.editor.saving' | t }} }
            @case ('dirty') { {{ 'cv.editor.unsaved' | t }} }
            @case ('error') {
              <app-icon name="alert" [size]="13" /> {{ 'cv.editor.saveFailed' | t: { reason: state.saveError() } }}
              <button type="button" class="link-btn" (click)="state.save()">{{ 'cv.editor.retry' | t }}</button>
            }
          }
        </span>
        <div class="cv-downloads" data-tour="cv-download">
          <button type="button" class="btn btn-primary btn-sm" (click)="download('pdf')" [disabled]="downloading()">
            <app-icon name="download" [size]="15" /> {{ 'cv.downloadPdf' | t }}</button>
          <button type="button" class="btn btn-secondary btn-sm" (click)="download('docx')" [disabled]="downloading()">
            <app-icon name="file" [size]="15" /> {{ 'cv.downloadDocx' | t }}</button>
        </div>
      </header>
      @if (downloading()) { <p class="small muted" role="status">{{ 'cv.downloading' | t }}</p> }

      <div class="cv-mobile-tabs" role="tablist">
        <button type="button" role="tab" [attr.aria-selected]="mobileView() === 'edit'" (click)="mobileView.set('edit')">{{ 'cv.editor.tabs.edit' | t }}</button>
        <button type="button" role="tab" [attr.aria-selected]="mobileView() === 'preview'" (click)="mobileView.set('preview')">
          {{ 'cv.editor.tabs.preview' | t }} @if (state.preview(); as p) { <span class="chip-count">{{ p.pageCount }}</span> }</button>
      </div>

      <div class="cv-layout" [attr.data-view]="mobileView()">
        <section class="cv-edit card" data-tour="cv-editor">
          <div class="cv-panels" role="tablist" [attr.aria-label]="'cv.title' | t">
            @for (p of panels; track p.key) {
              <button type="button" role="tab" class="cv-panel-tab" [id]="'cvtab-' + p.key" [attr.aria-selected]="panel() === p.key"
                      [attr.aria-controls]="'cvpanel'" (click)="panel.set(p.key)" [attr.data-tour]="p.key === 'suggestions' ? 'cv-suggestions' : p.key === 'job' ? 'cv-tools' : null">
                <app-icon [name]="p.icon" [size]="14" /> {{ 'cv.editor.panels.' + p.key | t }}
              </button>
            }
          </div>
          <div id="cvpanel" role="tabpanel" [attr.aria-labelledby]="'cvtab-' + panel()" class="cv-panel-body">
            @switch (panel()) {
              @case ('content') { <app-cv-content [(step)]="step" /> }
              @case ('design') { <app-cv-design /> }
              @case ('suggestions') { <app-cv-suggestions /> }
              @case ('job') { <app-cv-job /> }
              @case ('ats') { <app-cv-ats (goTo)="goTo($event)" /> }
            }
          </div>
        </section>

        <section class="cv-preview" [attr.aria-label]="'cv.editor.preview' | t" data-tour="cv-preview">
          <div class="cv-preview-bar">
            <strong class="small">{{ 'cv.editor.preview' | t }}</strong>
            @if (state.preview(); as p) { <span class="small muted">{{ 'cv.editor.pages' | t: { n: p.pageCount } }}</span> }
            @if (state.previewLoading()) { <span class="small muted" role="status">{{ 'cv.editor.updating' | t }}</span> }
            <span class="grow"></span>
            <button type="button" class="icon-btn" (click)="zoomBy(-1)" [disabled]="zoom() === zooms[0]" [attr.aria-label]="'cv.editor.zoomOut' | t"><app-icon name="minimize" [size]="15" /></button>
            <span class="small cv-zoom" [attr.aria-label]="'cv.editor.zoom' | t">{{ zoom() }}%</span>
            <button type="button" class="icon-btn" (click)="zoomBy(1)" [disabled]="zoom() === zooms[zooms.length - 1]" [attr.aria-label]="'cv.editor.zoomIn' | t"><app-icon name="maximize" [size]="15" /></button>
          </div>
          @if (state.previewError()) { <p class="callout callout-warn small">{{ 'cv.editor.previewFailed' | t }}</p> }
          @if ((state.preview()?.pageCount ?? 0) > 1) { <p class="small muted cv-hint"><app-icon name="bulb" [size]="13" /> {{ 'cv.editor.onePageHint' | t }}</p> }
          <div class="cv-pages" [class.is-updating]="state.previewLoading()">
            @for (page of state.preview()?.pages ?? []; track $index; let i = $index) {
              <figure class="cv-page" [style.width.%]="zoom()">
                <img [src]="page" [alt]="'cv.editor.page' | t: { n: i + 1, total: state.preview()!.pageCount }" />
                <figcaption class="small muted">{{ 'cv.editor.page' | t: { n: i + 1, total: state.preview()!.pageCount } }}</figcaption>
              </figure>
            } @empty {
              <div class="cv-page cv-page-empty"><app-skeleton [rows]="8" /></div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .cv-head { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px; }
    .cv-title { flex: 1 1 220px; max-width: 420px; font-weight: 600; font-size: 1.05rem; }
    .cv-save { display: inline-flex; align-items: center; gap: 4px; color: var(--muted); }
    .cv-save[data-state='saved'] { color: var(--success); }
    .cv-save[data-state='error'] { color: var(--danger); }
    .cv-downloads { display: flex; gap: 8px; flex-wrap: wrap; margin-inline-start: auto; }
    .cv-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
    .cv-edit { padding: 0; overflow: hidden; }
    .cv-panels { display: flex; flex-wrap: wrap; border-bottom: 1px solid var(--border); background: var(--surface-2); }
    .cv-panel-tab { flex: none; display: inline-flex; gap: 6px; align-items: center; padding: 10px 12px; border: 0; border-bottom: 2px solid transparent;
      background: none; color: var(--text-2); font-size: .85rem; cursor: pointer; white-space: nowrap; }
    .cv-panel-tab[aria-selected='true'] { color: var(--accent-text); border-bottom-color: var(--accent); font-weight: 600; background: var(--surface); }
    .cv-panel-body { padding: 16px; }
    .cv-preview { position: sticky; top: calc(var(--topbar-h) + 12px); max-height: calc(100vh - var(--topbar-h) - 24px); display: flex; flex-direction: column;
      border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-3); overflow: hidden; }
    .cv-preview-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--surface); border-bottom: 1px solid var(--border); }
    .cv-zoom { min-width: 3.2em; text-align: center; }
    .cv-hint { display: flex; gap: 4px; align-items: center; padding: 6px 12px 0; margin: 0; }
    .cv-pages { overflow: auto; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 14px; transition: opacity .2s; }
    .cv-pages.is-updating { opacity: .75; }
    .cv-page { margin: 0; flex: none; max-width: none; }
    .cv-page img { display: block; width: 100%; height: auto; background: #fff; box-shadow: var(--shadow-lg); border-radius: 2px; }
    .cv-page figcaption { text-align: center; margin-top: 4px; }
    .cv-page-empty { width: 100%; aspect-ratio: 210 / 297; background: var(--surface); padding: 24px; border-radius: 2px; }
    .cv-mobile-tabs { display: none; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    @media (max-width: 1100px) {
      .cv-layout { grid-template-columns: minmax(0, 1fr); }
      .cv-mobile-tabs { display: flex; gap: 4px; margin-bottom: 10px; padding: 4px; border-radius: var(--radius-sm); background: var(--surface-2); border: 1px solid var(--border); }
      .cv-mobile-tabs button { flex: 1; padding: 8px; border: 0; border-radius: var(--radius-xs); background: none; color: var(--text-2); font-weight: 600; cursor: pointer; }
      .cv-mobile-tabs button[aria-selected='true'] { background: var(--surface); color: var(--accent-text); box-shadow: var(--shadow-sm); }
      .cv-layout[data-view='edit'] .cv-preview { display: none; }
      .cv-layout[data-view='preview'] .cv-edit { display: none; }
      .cv-preview { position: static; max-height: none; }
      .cv-downloads { margin-inline-start: 0; width: 100%; }
    }
  `,
})
export default class CvEditorPage {
  readonly id = input.required<string>();
  protected readonly state = inject(CvEditorState);
  private readonly api = inject(CvApiService);
  private readonly toast = inject(ToastService);
  private readonly errorText = useCvErrors();

  protected readonly panels = PANELS;
  protected readonly zooms = ZOOMS;
  protected readonly panel = signal<Panel>('content');
  protected readonly step = signal<ContentStep>('personal');
  protected readonly zoom = signal(100);
  protected readonly mobileView = signal<'edit' | 'preview'>('edit');
  protected readonly downloading = signal(false);
  protected readonly loadError = signal<ApiError | null>(null);
  private readonly numericId = computed(() => Number(this.id()));

  constructor() {
    // The same page opens another CV (e.g. a new tailored copy) when the id in the address changes.
    effect(() => {
      this.numericId();
      untracked(() => void this.load());
    });
  }

  protected async load(): Promise<void> {
    this.loadError.set(null);
    await this.state.flush();
    try {
      const [cv, templates] = await Promise.all([this.api.get(this.numericId()), this.api.templates()]);
      this.state.load(cv, templates);
    } catch (e) {
      this.loadError.set(ApiError.from(e));
    }
  }

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }

  protected zoomBy(direction: number): void {
    const i = ZOOMS.indexOf(this.zoom()) + direction;
    if (i >= 0 && i < ZOOMS.length) this.zoom.set(ZOOMS[i]);
  }

  protected goTo(target: string): void {
    if (target === 'design') { this.panel.set('design'); return; }
    if ((CONTENT_STEPS as readonly string[]).includes(target)) { this.step.set(target as ContentStep); this.panel.set('content'); }
  }

  /** Exports the saved CV, so unsaved edits are saved first. */
  protected async download(format: 'pdf' | 'docx'): Promise<void> {
    this.downloading.set(true);
    try {
      if (!(await this.state.flush())) { this.toast.error(this.state.saveError()); return; }
      await this.api.download(this.state.id(), format);
    } catch (e) {
      this.toast.error(this.errorText(e));
    } finally {
      this.downloading.set(false);
    }
  }
}

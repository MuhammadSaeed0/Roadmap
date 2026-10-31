import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { CvApiService, CvSummary, CvTemplate } from './cv-api.service';
import { useCvErrors } from './cv-strings';

/** CV builder home: the user's CVs and the template gallery. */
@Component({
  selector: 'app-cv-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'cv.title' | t" [subtitle]="'cv.subtitle' | t">
      <button type="button" class="btn btn-primary" (click)="openCreate()" data-tour="cv-new"><app-icon name="plus" [size]="16" /> {{ 'cv.newCv' | t }}</button>
    </app-page-header>
    <p class="callout small"><app-icon name="lock" [size]="15" /> {{ 'cv.privacy' | t }}</p>

    <section aria-labelledby="cv-list-h" data-tour="cv-list">
      <h2 id="cv-list-h" class="section-title">{{ 'cv.myCvs' | t }}</h2>
      @if (cvs.initialLoading()) {
        <div class="card"><app-skeleton [rows]="3" /></div>
      } @else if (cvs.error()) {
        <app-error-state [error]="cvs.error()" (retry)="cvs.reload()" />
      } @else if (cvs.value(); as list) {
        @if (list.length === 0) {
          <app-empty-state icon="file" [title]="'cv.noCvs' | t" [message]="'cv.noCvsHint' | t" />
        } @else {
          <ul class="cv-cards" role="list">
            @for (cv of list; track cv.id) {
              <li class="card cv-card">
                <a [routerLink]="['/cv', cv.id]" class="cv-card-thumb" [attr.aria-label]="cv.title">
                  <img [src]="api.thumbnailUrl(cv.templateKey)" alt="" loading="lazy" width="160" height="226" />
                </a>
                <div class="cv-card-body">
                  <a [routerLink]="['/cv', cv.id]" class="cv-card-title">{{ cv.title }}</a>
                  <span class="small muted">{{ templateName(cv.templateKey) }}</span>
                  @if (cv.tailoredFor) { <span class="chip chip-sm"><app-icon name="target" [size]="12" /> {{ 'cv.card.tailoredFor' | t: { job: cv.tailoredFor } }}</span> }
                  @else if (cv.parentId) { <span class="chip chip-sm chip-ghost">{{ 'cv.card.copyOf' | t }}</span> }
                  <span class="small muted">{{ 'cv.card.updated' | t: { date: (cv.updatedAt | fmtDate) } }}</span>
                  <div class="cv-card-actions">
                    <a [routerLink]="['/cv', cv.id]" class="btn btn-sm btn-primary"><app-icon name="edit" [size]="14" /> {{ 'cv.card.open' | t }}</a>
                    <button type="button" class="btn btn-sm btn-secondary" (click)="download(cv, 'pdf')" [disabled]="busy() === cv.id + 'pdf'">
                      <app-icon name="download" [size]="14" /> PDF</button>
                    <button type="button" class="btn btn-sm btn-secondary" (click)="download(cv, 'docx')" [disabled]="busy() === cv.id + 'docx'">
                      <app-icon name="download" [size]="14" /> Word</button>
                    <button type="button" class="icon-btn" (click)="duplicate(cv)" [attr.aria-label]="('cv.card.duplicate' | t) + ': ' + cv.title" [title]="'cv.card.duplicate' | t">
                      <app-icon name="copy" [size]="15" /></button>
                    <button type="button" class="icon-btn" (click)="remove(cv)" [attr.aria-label]="('common.delete' | t) + ': ' + cv.title" [title]="'common.delete' | t">
                      <app-icon name="trash" [size]="15" /></button>
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      }
    </section>

    <section aria-labelledby="cv-tpl-h" class="section-gap" data-tour="cv-templates">
      <h2 id="cv-tpl-h" class="section-title">{{ 'cv.templatesTitle' | t }}</h2>
      <p class="muted small">{{ 'cv.templatesHint' | t }}</p>
      <ul class="cv-gallery" role="list">
        @for (tpl of templates.value() ?? []; track tpl.key) {
          <li>
            <button type="button" class="cv-template" (click)="openCreate(tpl.key)">
              <img [src]="api.thumbnailUrl(tpl.key)" alt="" loading="lazy" width="200" height="283" />
              <strong>{{ tpl | loc: 'name' }}</strong>
              <span class="small muted">{{ tpl | loc: 'description' }}</span>
              <span class="cv-template-badges">
                @if (tpl.atsFriendly) { <span class="badge badge-success">{{ 'cv.atsBadge' | t }}</span> }
                @if (tpl.supportsPhoto) { <span class="badge">{{ 'cv.photoBadge' | t }}</span> }
              </span>
            </button>
          </li>
        }
      </ul>
    </section>

    <dialog #createDialog class="dialog dialog-wide" (cancel)="$event.preventDefault(); creating.set(false)" aria-labelledby="cv-create-title">
      @if (creating()) {
        <form (ngSubmit)="create()">
          <h2 id="cv-create-title">{{ 'cv.create.title' | t }}</h2>
          <div class="field">
            <label for="cv-name">{{ 'cv.create.name' | t }}</label>
            <input id="cv-name" class="input" name="title" required maxlength="100" [(ngModel)]="newTitle" [placeholder]="'cv.create.namePlaceholder' | t" />
          </div>
          <div class="field">
            <label for="cv-role">{{ 'cv.create.targetRole' | t }}</label>
            <input id="cv-role" class="input" name="role" maxlength="120" [(ngModel)]="newRole" aria-describedby="cv-role-hint" />
            <small id="cv-role-hint" class="muted small">{{ 'cv.create.targetRoleHint' | t }}</small>
          </div>
          <fieldset class="fieldset">
            <legend>{{ 'cv.create.template' | t }}</legend>
            <div class="cv-pick">
              @for (tpl of templates.value() ?? []; track tpl.key) {
                <label class="cv-pick-item" [class.selected]="newTemplate() === tpl.key">
                  <input type="radio" name="template" [value]="tpl.key" [checked]="newTemplate() === tpl.key" (change)="newTemplate.set(tpl.key)" />
                  <img [src]="api.thumbnailUrl(tpl.key)" alt="" width="110" height="156" />
                  <span class="small">{{ tpl | loc: 'name' }}</span>
                </label>
              }
            </div>
          </fieldset>
          @if (createError()) { <p class="field-error" role="alert">{{ createError() }}</p> }
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="creating.set(false)">{{ 'common.cancel' | t }}</button>
            <button type="submit" class="btn btn-primary" [disabled]="!newTitle.trim() || saving()">{{ 'cv.create.create' | t }}</button>
          </div>
        </form>
      }
    </dialog>
  `,
  styles: `
    .cv-cards { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); }
    .cv-card { display: flex; gap: 16px; padding: 14px; align-items: flex-start; }
    .cv-card-thumb { flex: none; border: 1px solid var(--border); border-radius: var(--radius-xs); overflow: hidden; background: #fff; line-height: 0; }
    .cv-card-thumb img { width: 110px; height: auto; display: block; }
    .cv-card-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
    .cv-card-title { font-weight: 650; font-size: 1.05rem; color: var(--text); overflow-wrap: anywhere; }
    .cv-card-actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: auto; padding-top: 6px; }
    .cv-gallery { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr)); }
    .cv-template { display: flex; flex-direction: column; gap: 6px; text-align: start; width: 100%; height: 100%; padding: 10px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; transition: border-color .15s, box-shadow .15s; }
    .cv-template:hover, .cv-template:focus-visible { border-color: var(--accent); box-shadow: var(--shadow); }
    .cv-template img { width: 100%; height: auto; border-radius: var(--radius-xs); border: 1px solid var(--border); background: #fff; }
    .cv-template-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; }
    .cv-pick { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
    .cv-pick-item { display: flex; flex-direction: column; gap: 4px; align-items: center; padding: 6px; border-radius: var(--radius-xs); border: 2px solid transparent; cursor: pointer; text-align: center; }
    .cv-pick-item.selected { border-color: var(--accent); background: var(--accent-soft); }
    .cv-pick-item input { position: absolute; opacity: 0; pointer-events: none; }
    .cv-pick-item:has(input:focus-visible) { box-shadow: var(--focus); }
    .cv-pick-item img { width: 100%; height: auto; border: 1px solid var(--border); border-radius: 4px; background: #fff; }
  `,
})
export default class CvDashboardPage {
  protected readonly api = inject(CvApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly errorText = useCvErrors();
  private readonly createDialog = viewChild<ElementRef<HTMLDialogElement>>('createDialog');

  protected readonly cvs = createLoader(() => this.api.list());
  protected readonly templates = createLoader(() => this.api.templates());
  protected readonly busy = signal('');
  protected readonly creating = signal(false);
  protected readonly saving = signal(false);
  protected readonly createError = signal('');
  protected readonly newTemplate = signal('modern');
  protected newTitle = '';
  protected newRole = '';

  constructor() {
    effect(() => {
      const dialog = this.createDialog()?.nativeElement;
      if (!dialog) return;
      if (this.creating() && !dialog.open) dialog.showModal();
      if (!this.creating() && dialog.open) dialog.close();
    });
  }

  protected templateName(key: string): string {
    const tpl = this.templates.value()?.find((t: CvTemplate) => t.key === key);
    return tpl ? this.i18n.loc(tpl, 'name') : key;
  }

  protected openCreate(template = 'modern'): void {
    this.newTemplate.set(template);
    this.newTitle = this.i18n.t('cv.title');
    this.newRole = '';
    this.createError.set('');
    this.creating.set(true);
  }

  protected async create(): Promise<void> {
    if (!this.newTitle.trim()) return;
    this.saving.set(true);
    try {
      const cv = await this.api.create({ title: this.newTitle.trim(), templateKey: this.newTemplate(), targetRole: this.newRole.trim() || null });
      this.creating.set(false);
      await this.router.navigate(['/cv', cv.summary.id]);
    } catch (e) {
      this.createError.set(this.errorText(e));
    } finally {
      this.saving.set(false);
    }
  }

  protected async duplicate(cv: CvSummary): Promise<void> {
    try {
      const copy = await this.api.duplicate(cv.id);
      this.cvs.update(list => [copy.summary, ...list]);
      this.toast.success(this.i18n.t('cv.card.duplicated'));
    } catch (e) {
      this.toast.error(this.errorText(e));
    }
  }

  protected async download(cv: CvSummary, format: 'pdf' | 'docx'): Promise<void> {
    this.busy.set(cv.id + format);
    try {
      await this.api.download(cv.id, format);
    } catch (e) {
      this.toast.error(this.errorText(e));
    } finally {
      this.busy.set('');
    }
  }

  protected async remove(cv: CvSummary): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('cv.card.deleteConfirm', { name: cv.title }), danger: true, confirmText: this.i18n.t('common.delete') }))) return;
    try {
      await this.api.remove(cv.id);
      this.cvs.update(list => list.filter(c => c.id !== cv.id));
      this.toast.success(this.i18n.t('cv.card.deleted'));
    } catch (e) {
      this.toast.error(this.errorText(e));
    }
  }
}

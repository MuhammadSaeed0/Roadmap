import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import '../../core/i18n/workspace-strings';
import { TranslatePipe } from '../../core/i18n/pipes';
import { WorkspaceFile, WorkspaceKind } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { templateByKey } from '../../core/workspace/templates';
import { IconComponent } from '../../shared/icon.component';
import { IdeComponent } from '../../shared/ide/ide.component';
import { EmptyStateComponent, SkeletonComponent } from '../../shared/ui.components';

type SaveState = 'draft' | 'saving' | 'saved' | 'error';
const DRAFT_PREFIX = 'devpath.playground.draft.';

/**
 * One Code Playground workspace. A new workspace (from a template) is a draft kept in this browser until you
 * save it; a saved project lives in your account and saves itself as you type.
 */
@Component({
  selector: 'app-workspace-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe, IdeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="workspace-head">
      <a routerLink="/playground" class="link-btn link-sm"><app-icon name="chevron-left" [size]="14" /> {{ 'playground.title' | t }}</a>
      @if (kind(); as k) {
        <div class="workspace-title" data-tour="workspace-title">
          @if (editingName()) {
            <form class="row-gap" (ngSubmit)="saveName()">
              <label class="sr-only" for="ws-name">{{ 'playground.projectName' | t }}</label>
              <input id="ws-name" class="input input-sm" name="name" [ngModel]="nameDraft()" (ngModelChange)="nameDraft.set($event)" maxlength="100" required (keydown.escape)="editingName.set(false)">
              <button type="submit" class="btn btn-primary btn-sm">{{ (projectId() ? 'common.save' : 'playground.saveProject') | t }}</button>
              <button type="button" class="btn btn-ghost btn-sm" (click)="editingName.set(false)">{{ 'common.cancel' | t }}</button>
            </form>
          } @else {
            <h1 class="workspace-name">{{ name() }}</h1>
            <span class="chip chip-sm">{{ ('playground.kind.' + k) | t }}</span>
            @if (projectId()) {
              <button type="button" class="icon-btn" (click)="startRename()" [attr.aria-label]="'playground.rename' | t"><app-icon name="edit" [size]="15" /></button>
            }
          }
        </div>
        <div class="row-gap">
          @if (!projectId()) {
            <button type="button" class="btn btn-primary btn-sm" (click)="startRename()" data-tour="workspace-save"><app-icon name="check" [size]="14" /> {{ 'playground.saveProject' | t }}</button>
          }
          @if (template()) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="resetToTemplate()"><app-icon name="refresh" [size]="14" /> {{ 'playground.resetTemplate' | t }}</button>
          }
          @if (projectId()) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="deleteProject()"><app-icon name="trash" [size]="14" /> {{ 'common.delete' | t }}</button>
          }
        </div>
      }
    </div>

    @if (loading()) {
      <div class="card"><app-skeleton [rows]="8" /></div>
    } @else if (failed()) {
      <app-empty-state icon="alert" [title]="'playground.notFound' | t">
        <a routerLink="/playground" class="btn btn-secondary">{{ 'playground.title' | t }}</a>
      </app-empty-state>
    } @else if (kind(); as k) {
      @if (!projectId()) { <p class="callout small">{{ 'playground.draftNote' | t }}</p> }
      <app-ide data-tour="workspace-ide" [kind]="k" [files]="files()" [entry]="entry()" [dataset]="dataset()" [name]="name()"
               [saveLabel]="saveLabel()" (changed)="onChanged($event)" (saveRequested)="saveNow($event)" />
    }
  `,
})
export default class WorkspacePage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  /** Route parameters (component input binding). */
  readonly id = input<string>();
  readonly templateKey = input<string | undefined>(undefined, { alias: 'template' });

  protected readonly kind = signal<WorkspaceKind | null>(null);
  protected readonly files = signal<WorkspaceFile[]>([]);
  protected readonly entry = signal<string | null>(null);
  protected readonly dataset = signal('');
  protected readonly name = signal('');
  protected readonly template = signal<string | null>(null);
  protected readonly projectId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly saveState = signal<SaveState>('draft');
  protected readonly editingName = signal(false);
  protected readonly nameDraft = signal('');
  private latest: WorkspaceFile[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly saveLabel = computed(() => this.i18n.t('playground.saveState.' + this.saveState()));

  constructor() {
    effect(() => {
      const id = this.id();
      const template = this.templateKey();
      untracked(() => void this.open(id, template));
    });
  }

  private async open(id: string | undefined, templateKey: string | undefined): Promise<void> {
    this.loading.set(true);
    this.failed.set(false);
    try {
      if (id && /^\d+$/.test(id)) {
        const project = await this.api.playgroundProject(Number(id));
        const tpl = templateByKey(project.summary.template);
        this.kind.set(project.summary.kind);
        this.name.set(project.summary.name);
        this.template.set(project.summary.template);
        this.dataset.set(tpl?.dataset ?? '');
        this.entry.set(tpl?.entry ?? null);
        this.projectId.set(project.summary.id);
        this.saveState.set('saved');
        this.latest = project.files;
        this.files.set(project.files);
      } else {
        const tpl = templateByKey(templateKey);
        if (!tpl) { this.failed.set(true); return; }
        this.kind.set(tpl.kind);
        this.name.set(this.i18n.loc(tpl, 'name'));
        this.template.set(tpl.key);
        this.dataset.set(tpl.dataset ?? '');
        this.entry.set(tpl.entry);
        this.projectId.set(null);
        this.saveState.set('draft');
        const draft = readDraft(tpl.key);
        this.latest = draft ?? tpl.files;
        this.files.set(this.latest);
      }
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected onChanged(files: WorkspaceFile[]): void {
    this.latest = files;
    const id = this.projectId();
    if (!id) { writeDraft(this.template()!, files); return; }
    this.saveState.set('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.persist(id), 600);
  }

  protected saveNow(files: WorkspaceFile[]): void {
    this.latest = files;
    const id = this.projectId();
    if (id) { clearTimeout(this.saveTimer); void this.persist(id); }
    else this.startRename();
  }

  private async persist(id: number): Promise<void> {
    try {
      await this.api.updatePlaygroundProject(id, { files: this.latest });
      this.saveState.set('saved');
    } catch {
      this.saveState.set('error');
    }
  }

  protected startRename(): void {
    this.nameDraft.set(this.name());
    this.editingName.set(true);
  }

  protected async saveName(): Promise<void> {
    const name = this.nameDraft().trim();
    if (!name) return;
    try {
      const id = this.projectId();
      if (id) {
        await this.api.updatePlaygroundProject(id, { name });
        this.name.set(name);
      } else {
        const project = await this.api.createPlaygroundProject({ name, kind: this.kind()!, template: this.template(), files: this.latest });
        clearDraft(this.template()!);
        this.toast.success(this.i18n.t('playground.saved'));
        await this.router.navigate(['/playground', project.summary.id], { replaceUrl: true });
      }
      this.editingName.set(false);
    } catch (e) {
      this.toast.error(this.i18n.t('playground.saveFailed'));
    }
  }

  protected async resetToTemplate(): Promise<void> {
    const tpl = templateByKey(this.template());
    if (!tpl) return;
    if (!(await this.confirm.ask({ message: this.i18n.t('playground.resetConfirm'), danger: true, confirmText: this.i18n.t('common.reset') }))) return;
    this.latest = tpl.files;
    this.files.set(tpl.files.map(f => ({ ...f })));
    this.onChanged(this.latest);
  }

  protected async deleteProject(): Promise<void> {
    const id = this.projectId();
    if (!id) return;
    if (!(await this.confirm.ask({ message: this.i18n.t('playground.deleteConfirm', { name: this.name() }), danger: true, confirmText: this.i18n.t('common.delete') }))) return;
    await this.api.deletePlaygroundProject(id);
    this.toast.success(this.i18n.t('playground.deleted'));
    await this.router.navigate(['/playground']);
  }
}

function readDraft(key: string): WorkspaceFile[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    const files = raw ? JSON.parse(raw) : null;
    return Array.isArray(files) ? files : null;
  } catch {
    return null;
  }
}

function writeDraft(key: string, files: WorkspaceFile[]): void {
  try { localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(files)); } catch { /* storage full or blocked: the draft just isn't kept */ }
}

function clearDraft(key: string): void {
  try { localStorage.removeItem(DRAFT_PREFIX + key); } catch { /* nothing to clear */ }
}

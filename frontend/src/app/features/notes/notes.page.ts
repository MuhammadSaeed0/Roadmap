import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Note, NoteRequest, Phase, ProjectSummary } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

type LinkKind = 'none' | 'topic' | 'project';

@Component({
  selector: 'app-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe,
    PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './notes.page.html',
})
export default class NotesPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  private readonly params = this.route.snapshot.queryParamMap;
  protected readonly q = signal('');
  /** Optional filter from a topic or project page (?topicId= / ?projectId=). */
  protected readonly topicFilter = signal<number | null>(Number(this.params.get('topicId')) || null);
  protected readonly projectFilter = signal<number | null>(Number(this.params.get('projectId')) || null);
  protected readonly selectedId = signal<number | 'new' | null>(null);
  protected readonly saving = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly data = createLoader(() => this.api.notes({ q: this.q(), topicId: this.topicFilter(), projectId: this.projectFilter() }));
  protected readonly phases = signal<Phase[]>([]);
  protected readonly projects = signal<ProjectSummary[]>([]);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.maxLength(20000)],
    linkKind: ['none' as LinkKind],
    linkId: [0],
  });

  protected readonly selected = computed<Note | null>(() => {
    const id = this.selectedId();
    return typeof id === 'number' ? this.data.value()?.find(n => n.id === id) ?? null : null;
  });

  constructor() {
    void this.loadLinkTargets();
    // Query params can change while this page is open (e.g. "New note" in the top bar, or a search result).
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = Number(params.get('id'));
      if (params.get('new')) {
        this.startNew();
        void this.router.navigate([], { queryParams: { new: null }, queryParamsHandling: 'merge', replaceUrl: true });
      } else if (id && id !== this.selectedId()) {
        void this.data.reload().then(() => this.select(id));
      }
    });
  }

  private async loadLinkTargets(): Promise<void> {
    try {
      const [roadmap, projects] = await Promise.all([this.api.roadmap(), this.api.projects()]);
      this.phases.set(roadmap.phases.filter(p => p.topics.length > 0));
      this.projects.set(projects);
    } catch { /* link pickers stay empty; the rest of the page still works */ }
  }

  protected onSearch(value: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.q.set(value.trim()); void this.data.reload(); }, 300);
  }

  protected clearFilter(): void {
    this.topicFilter.set(null);
    this.projectFilter.set(null);
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
    void this.data.reload();
  }

  private async canLeave(): Promise<boolean> {
    if (!this.form.dirty) return true;
    return this.confirm.ask({ message: this.i18n.t('notes.unsaved'), confirmText: this.i18n.t('common.continue') });
  }

  protected async open(note: Note): Promise<void> {
    if (this.selectedId() === note.id || !(await this.canLeave())) return;
    this.select(note.id);
  }

  private select(id: number): void {
    const note = this.data.value()?.find(n => n.id === id);
    if (!note) return;
    this.selectedId.set(id);
    const linkKind: LinkKind = note.linkType === 'topic' ? 'topic' : note.linkType === 'project' ? 'project' : 'none';
    this.form.reset({ title: note.title, content: note.content, linkKind, linkId: linkKind === 'none' ? 0 : note.linkId ?? 0 });
    void this.router.navigate([], { queryParams: { id }, replaceUrl: true });
  }

  protected async createNew(): Promise<void> {
    if (await this.canLeave()) this.startNew();
  }

  private startNew(): void {
    this.selectedId.set('new');
    const topicId = this.topicFilter();
    this.form.reset({ title: '', content: '', linkKind: topicId ? 'topic' : 'none', linkId: topicId ?? 0 });
    setTimeout(() => document.getElementById('note-title')?.focus(), 0);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const linkId = Number(v.linkId) || null;
    const body: NoteRequest = {
      title: v.title.trim(), content: v.content,
      topicId: v.linkKind === 'topic' ? linkId : null, projectId: v.linkKind === 'project' ? linkId : null,
      // Task and interview-question links are kept when editing a note that already has one.
      projectTaskId: this.selected()?.linkType === 'task' && v.linkKind === 'none' ? this.selected()!.linkId : null,
      interviewQuestionId: this.selected()?.linkType === 'question' && v.linkKind === 'none' ? this.selected()!.linkId : null,
    };
    this.saving.set(true);
    try {
      const id = this.selectedId();
      const saved = typeof id === 'number' ? await this.api.updateNote(id, body) : await this.api.createNote(body);
      this.form.markAsPristine();
      this.toast.success(this.i18n.t('notes.saved'));
      await this.data.reload();
      this.select(saved.id);
    } catch (e) {
      const err = ApiError.from(e);
      if (err.fieldErrors['title']) this.form.controls.title.setErrors({ server: err.fieldErrors['title'][0] });
      this.toast.error(this.i18n.errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(note: Note): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.t('common.delete'), message: this.i18n.t('notes.deleteConfirm', { title: note.title }),
      confirmText: this.i18n.t('common.delete'), danger: true,
    });
    if (!ok) return;
    try {
      await this.api.deleteNote(note.id);
      this.toast.success(this.i18n.t('notes.deleted'));
      this.selectedId.set(null);
      this.form.reset();
      void this.router.navigate([], { queryParams: {}, replaceUrl: true });
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected linkRoute(note: Note): unknown[] | null {
    switch (note.linkType) {
      case 'topic': return ['/topics', note.linkId];
      case 'project': return ['/projects', note.linkId];
      case 'task': return ['/projects', note.linkParentId];
      case 'question': return ['/interviews'];
      default: return null;
    }
  }

  protected excerpt(note: Note): string {
    return note.content.length > 90 ? note.content.slice(0, 90) + '…' : note.content;
  }
}

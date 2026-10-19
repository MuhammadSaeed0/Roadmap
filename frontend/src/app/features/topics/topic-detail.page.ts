import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { KnowledgeLevel, Note, TopicDetail, TopicStatus } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { SessionDialogService } from '../../layout/session-dialog.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { ConfidencePickerComponent, ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-topic-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatDatePipe,
    CodeBlockComponent, ConfidencePickerComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './topic-detail.page.html',
})
export default class TopicDetailPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly sessions = inject(SessionDialogService);

  /** Route parameter :id, bound via withComponentInputBinding(). */
  readonly id = input.required<string>();
  private readonly topicId = computed(() => Number(this.id()));

  protected readonly data = createLoader(() => this.api.topic(this.topicId()), { immediate: false });
  protected readonly notes = createLoader(() => this.api.notes({ topicId: this.topicId() }), { immediate: false });
  protected readonly saving = signal(false);
  protected readonly statusIcon = statusIcon;
  protected readonly knowledgeLevels: KnowledgeLevel[] = ['Unassessed', 'AlreadyKnow', 'NeedReview', 'NeedToLearn'];
  protected readonly showNoteForm = signal(false);

  protected readonly noteForm = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.maxLength(20000)],
  });

  /** Sections of the learning content, in the order defined by the curriculum. */
  protected readonly sections = computed(() => {
    const t = this.data.value();
    if (!t) return [];
    return [
      { id: 'what', icon: 'info', title: 'topic.whatIsIt', text: this.i18n.pick(t.summaryEn, t.summaryAr) },
      { id: 'why', icon: 'target', title: 'topic.whyMatters', text: this.i18n.pick(t.whyEn, t.whyAr) },
      { id: 'how', icon: 'layers', title: 'topic.howWorks', text: this.i18n.pick(t.howEn, t.howAr) },
      { id: 'example', icon: 'briefcase', title: 'topic.realWorld', text: this.i18n.pick(t.exampleEn, t.exampleAr) },
    ];
  });

  constructor() {
    // Reload when the route id changes (e.g. clicking a related topic).
    effect(() => {
      this.topicId();
      untracked(() => { void this.data.reload(); void this.notes.reload(); this.showNoteForm.set(false); });
    });
    effect(() => {
      if (this.sessions.savedCount() > 0) untracked(() => void this.data.reload());
    });
  }

  protected async update(changes: Partial<{ status: TopicStatus; knowledge: KnowledgeLevel; confidence: number | null }>): Promise<void> {
    const t = this.data.value();
    if (!t) return;
    const body = { status: t.status, knowledge: t.knowledge, confidence: t.confidence, ...changes };
    this.saving.set(true);
    try {
      const saved = await this.api.updateTopicProgress(t.id, body) as { completedAt: string | null };
      this.data.update(v => ({ ...v, ...body, completedAt: saved.completedAt }));
      this.toast.success(this.i18n.t('topic.saved'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }

  protected markKnown(): Promise<void> {
    const t = this.data.value();
    return this.update({ status: 'Skipped', knowledge: 'AlreadyKnow', confidence: t?.confidence ?? 4 });
  }

  protected async toggleReview(t: TopicDetail): Promise<void> {
    try {
      if (t.review) {
        await this.api.removeReview(t.id);
        this.toast.info(this.i18n.t('review.removed'));
      } else {
        await this.api.addReview(t.id);
        this.toast.success(this.i18n.t('review.added'));
      }
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected logSession(): void { this.sessions.open(this.topicId()); }

  protected async deleteSession(id: number): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('topic.deleteSession'), danger: true, confirmText: this.i18n.t('common.delete') }))) return;
    try {
      await this.api.deleteSession(id);
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected async addNote(): Promise<void> {
    if (this.noteForm.invalid) { this.noteForm.markAllAsTouched(); return; }
    const v = this.noteForm.getRawValue();
    try {
      await this.api.createNote({ title: v.title.trim(), content: v.content, topicId: this.topicId(), projectId: null, projectTaskId: null, interviewQuestionId: null });
      this.noteForm.reset();
      this.showNoteForm.set(false);
      this.toast.success(this.i18n.t('notes.saved'));
      await this.notes.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected noteExcerpt(note: Note): string {
    return note.content.length > 140 ? note.content.slice(0, 140) + '…' : note.content;
  }
}

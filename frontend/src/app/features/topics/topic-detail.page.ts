import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
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
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { ConfidencePickerComponent, ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { TopicQuizComponent } from './topic-quiz.component';
import { TopicDiscussionsComponent } from './topic-discussions.component';
import { TopicTutorialComponent } from './topic-tutorial.component';
import { TopicVideosComponent } from './topic-videos.component';

@Component({
  selector: 'app-topic-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatDatePipe,
    ConfidencePickerComponent, SkeletonComponent, ErrorStateComponent, TopicVideosComponent, TopicQuizComponent, TopicDiscussionsComponent, TopicTutorialComponent],
  templateUrl: './topic-detail.page.html',
  styleUrl: './topic-detail.page.css',
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

  /** The short answers under the overview's opening summary. */
  protected readonly facts = computed(() => {
    const t = this.data.value();
    if (!t) return [];
    return [
      { icon: 'target', title: 'topic.whyMatters', text: this.i18n.pick(t.whyEn, t.whyAr) },
      { icon: 'layers', title: 'topic.howWorks', text: this.i18n.pick(t.howEn, t.howAr) },
      { icon: 'briefcase', title: 'topic.realWorld', text: this.i18n.pick(t.exampleEn, t.exampleAr) },
    ].filter(f => f.text.trim().length > 0);
  });

  /** The sections of the page, in the order they appear, for the "On this page" list. */
  protected readonly toc = [
    { id: 'overview', icon: 'info', title: 'topic.overview' },
    { id: 'tutorial', icon: 'book', title: 'tutorial.title' },
    { id: 'videos', icon: 'video', title: 'videos.title' },
    { id: 'quiz', icon: 'target', title: 'topic.tocQuiz' },
    { id: 'practice', icon: 'edit', title: 'topic.practice' },
    { id: 'discussions', icon: 'message-square', title: 'discussions.title' },
    { id: 'resources', icon: 'link', title: 'topic.resources' },
    { id: 'notes', icon: 'note', title: 'topic.notes' },
  ];
  protected readonly activeSection = signal('overview');
  protected readonly allQuestions = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private observer: IntersectionObserver | null = null;

  /** What the learner should be able to do after the topic, in the current language. */
  protected readonly objectives = computed(() => {
    const t = this.data.value();
    if (!t) return [];
    return t.objectivesEn.map((en, i) => this.i18n.pick(en, t.objectivesAr[i]));
  });

  constructor() {
    // Reload when the route id changes (e.g. clicking a related topic).
    effect(() => {
      this.topicId();
      untracked(() => {
        void this.data.reload(); void this.notes.reload();
        this.showNoteForm.set(false); this.allQuestions.set(false); this.activeSection.set('overview');
      });
    });
    // Highlight the section being read once the sections are on the page.
    effect(() => {
      if (this.data.value()) untracked(() => setTimeout(() => this.watchSections()));
    });
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
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

  /** Scrolls to a section without changing the route. */
  protected goTo(event: Event, id: string): void {
    event.preventDefault();
    this.host.querySelector<HTMLElement>('#' + id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    this.activeSection.set(id);
  }

  private watchSections(): void {
    this.observer?.disconnect();
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set<string>();
    this.observer = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id);
      }
      const first = this.toc.find(s => visible.has(s.id));
      if (first) this.activeSection.set(first.id);
    }, { rootMargin: '-80px 0px -55% 0px' });
    for (const s of this.toc) {
      const el = this.host.querySelector('#' + s.id);
      if (el) this.observer.observe(el);
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

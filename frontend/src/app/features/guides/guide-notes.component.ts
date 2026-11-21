import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { Note } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';

/** On a Project library page: the learner's notes about this project, each optionally about one step. */
@Component({
  selector: 'app-guide-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, TranslatePipe],
  template: `
    <section class="card" id="guide-notes" aria-labelledby="gnotes-h">
      <div class="card-head">
        <h2 id="gnotes-h" class="side-title"><app-icon name="note" [size]="16" /> {{ 'guides.notesTitle' | t }}</h2>
        @if (!formOpen()) {
          <button type="button" class="btn btn-ghost btn-sm" (click)="openForm(0)"><app-icon name="plus" [size]="14" /> {{ 'topic.addNote' | t }}</button>
        }
      </div>
      @if (formOpen()) {
        <form class="stack" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <label class="sr-only" for="gn-title">{{ 'notes.titleLabel' | t }}</label>
          <input id="gn-title" class="input input-sm" formControlName="title" maxlength="200" [placeholder]="'notes.titleLabel' | t" />
          <label class="sr-only" for="gn-step">{{ 'guides.noteStep' | t }}</label>
          <select id="gn-step" class="input input-sm" formControlName="step">
            <option [ngValue]="0">{{ 'guides.wholeProject' | t }}</option>
            @for (n of stepNumbers(); track n) { <option [ngValue]="n">{{ 'guides.step' | t: { n } }}</option> }
          </select>
          <label class="sr-only" for="gn-content">{{ 'notes.contentLabel' | t }}</label>
          <textarea id="gn-content" class="input" rows="4" maxlength="20000" dir="auto" formControlName="content"></textarea>
          <div class="row-gap">
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">{{ 'common.save' | t }}</button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="formOpen.set(false)">{{ 'common.cancel' | t }}</button>
          </div>
        </form>
      }
      @if (notes().length === 0 && !formOpen()) {
        <p class="small muted">{{ 'guides.noNotes' | t }}</p>
      }
      <ul class="side-list guide-note-list" role="list">
        @for (n of notes(); track n.id) {
          <li>
            <a [routerLink]="['/notes']" [queryParams]="{ id: n.id }"><strong>{{ n.title }}</strong></a>
            @if (n.guidedStepOrder) { <span class="tiny muted">{{ 'guides.step' | t: { n: n.guidedStepOrder } }}</span> }
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .guide-note-list li { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  `,
})
export class GuideNotesComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  readonly projectId = input.required<number>();
  readonly stepCount = input.required<number>();

  protected readonly notes = signal<Note[]>([]);
  protected readonly formOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.maxLength(20000)],
    step: [0],
  });

  protected stepNumbers(): number[] { return Array.from({ length: this.stepCount() }, (_, i) => i + 1); }

  constructor() {
    effect(() => {
      const id = this.projectId();
      untracked(() => void this.load(id));
    });
  }

  /** Opens the form, about one step (from that step's "Add a note") or the whole project (0). */
  openForm(step: number): void {
    this.form.reset({ title: '', content: '', step });
    this.formOpen.set(true);
    setTimeout(() => {
      document.getElementById('guide-notes')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      document.getElementById('gn-title')?.focus();
    }, 0);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    this.saving.set(true);
    try {
      await this.api.createNote({
        title: v.title.trim(), content: v.content, topicId: null, projectId: null, projectTaskId: null, interviewQuestionId: null,
        guidedProjectId: this.projectId(), guidedStepOrder: v.step || null,
      });
      this.toast.success(this.i18n.t('notes.saved'));
      this.formOpen.set(false);
      await this.load(this.projectId());
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }

  private async load(id: number): Promise<void> {
    try { this.notes.set(await this.api.notes({ guidedProjectId: id })); } catch { this.notes.set([]); }
  }
}

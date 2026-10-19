import { ChangeDetectionStrategy, Component, ElementRef, Injectable, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ApiError } from '../core/api-error';
import { I18nService } from '../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../core/i18n/pipes';
import { Phase } from '../core/models';
import { ToastService } from '../core/ui-services';

/** Opens the "log study session" dialog from anywhere and tells listeners when a session was saved. */
@Injectable({ providedIn: 'root' })
export class SessionDialogService {
  readonly request = signal<{ topicId: number | null } | null>(null);
  /** Incremented after each successful save so pages can reload. */
  readonly savedCount = signal(0);

  open(topicId: number | null = null): void { this.request.set({ topicId }); }
  close(): void { this.request.set(null); }
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-session-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, LocalizePipe],
  template: `
    <dialog #dialog class="dialog dialog-wide" (cancel)="$event.preventDefault(); sessions.close()" aria-labelledby="session-title">
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <h2 id="session-title">{{ 'quickAdd.session' | t }}</h2>

        <div class="field">
          <label for="s-topic">{{ 'quickAdd.topicLabel' | t }}</label>
          <select id="s-topic" formControlName="topicId" class="input">
            <option [ngValue]="null">{{ 'quickAdd.chooseTopic' | t }}</option>
            @for (phase of phases(); track phase.id) {
              <optgroup [label]="phase | loc: 'title'">
                @for (topic of phase.topics; track topic.id) {
                  <option [ngValue]="topic.id">{{ topic | loc: 'title' }}</option>
                }
              </optgroup>
            }
          </select>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="s-planned">{{ 'topic.planned' | t }} <span class="muted">({{ 'common.optional' | t }})</span></label>
            <input id="s-planned" type="number" min="1" max="1440" class="input" formControlName="plannedMinutes" />
          </div>
          <div class="field">
            <label for="s-actual">{{ 'topic.actual' | t }}</label>
            <input id="s-actual" type="number" min="1" max="1440" class="input" formControlName="actualMinutes"
                   [attr.aria-invalid]="showError('actualMinutes')" aria-describedby="s-actual-err" />
            @if (showError('actualMinutes')) {
              <small id="s-actual-err" class="field-error">{{ minutesError() }}</small>
            }
          </div>
          <div class="field">
            <label for="s-date">{{ 'topic.date' | t }}</label>
            <input id="s-date" type="date" class="input" formControlName="sessionDate" [max]="maxDate" />
          </div>
        </div>

        <div class="field">
          <label for="s-note">{{ 'topic.note' | t }} <span class="muted">({{ 'common.optional' | t }})</span></label>
          <textarea id="s-note" rows="3" class="input" formControlName="note" maxlength="1000"></textarea>
        </div>

        @if (serverError()) { <p class="field-error" role="alert">{{ serverError() }}</p> }

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" (click)="sessions.close()">{{ 'common.cancel' | t }}</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            {{ (saving() ? 'common.saving' : 'common.save') | t }}
          </button>
        </div>
      </form>
    </dialog>
  `,
})
export class SessionDialogComponent {
  protected readonly sessions = inject(SessionDialogService);
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly phases = signal<Phase[]>([]);
  protected readonly saving = signal(false);
  protected readonly serverError = signal('');
  protected readonly maxDate = today();

  protected readonly form = inject(FormBuilder).group({
    topicId: [null as number | null],
    plannedMinutes: [null as number | null, [Validators.min(1), Validators.max(1440)]],
    actualMinutes: [30 as number | null, [Validators.required, Validators.min(1), Validators.max(1440)]],
    sessionDate: [today(), Validators.required],
    note: [''],
  });

  protected readonly minutesError = computed(() => this.i18n.t('validation.min', { min: 1 }));

  constructor() {
    effect(() => {
      const request = this.sessions.request();
      const el = this.dialog().nativeElement;
      if (request && !el.open) {
        this.form.reset({ topicId: request.topicId, plannedMinutes: null, actualMinutes: 30, sessionDate: today(), note: '' });
        this.serverError.set('');
        if (this.phases().length === 0) void this.loadTopics();
        el.showModal();
      } else if (!request && el.open) {
        el.close();
      }
    });
  }

  protected showError(name: 'actualMinutes'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  private async loadTopics(): Promise<void> {
    try {
      this.phases.set((await this.api.roadmap()).phases.filter(p => p.topics.length > 0));
    } catch { /* the select simply stays empty; the error banner explains offline state */ }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.serverError.set('');
    try {
      await this.api.addSession({
        topicId: v.topicId, projectTaskId: null, plannedMinutes: v.plannedMinutes || null,
        actualMinutes: Number(v.actualMinutes), sessionDate: v.sessionDate!, note: v.note?.trim() || null,
      });
      this.toast.success(this.i18n.t('topic.sessionSaved'));
      this.sessions.savedCount.update(n => n + 1);
      this.sessions.close();
    } catch (e) {
      this.serverError.set(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }
}

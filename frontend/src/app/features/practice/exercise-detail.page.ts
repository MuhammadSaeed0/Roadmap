import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ExerciseDetail } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { TYPE_ICONS } from './practice.page';

@Component({
  selector: 'app-exercise-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatDatePipe,
    CodeBlockComponent, SkeletonComponent, ErrorStateComponent],
  templateUrl: './exercise-detail.page.html',
})
export default class ExerciseDetailPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly id = input.required<string>();
  protected readonly data = createLoader(() => this.api.exercise(Number(this.id())), { immediate: false });
  protected readonly busy = signal(false);
  protected readonly answer = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(10000)] });
  protected readonly typeIcons = TYPE_ICONS;

  protected readonly hints = computed(() => {
    const d = this.data.value();
    if (!d) return [];
    return this.i18n.lang() === 'ar' && d.revealedHintsAr.length === d.revealedHintsEn.length ? d.revealedHintsAr : d.revealedHintsEn;
  });

  /** Where the learner is in the Read → Investigate → Hints → Solution → Complete workflow. */
  protected readonly step = computed(() => {
    const d = this.data.value();
    if (!d) return 0;
    if (d.summary.status === 'Completed') return 4;
    if (d.solutionRevealed) return 3;
    if (d.revealedHintsEn.length > 0) return 2;
    if (d.userAnswer) return 1;
    return 0;
  });
  protected readonly steps = ['read', 'investigate', 'hint', 'solution', 'complete'];

  constructor() {
    effect(() => {
      this.id();
      untracked(async () => {
        await this.data.reload();
        this.answer.reset(this.data.value()?.userAnswer ?? '');
      });
    });
  }

  private async run(action: () => Promise<ExerciseDetail>, successKey?: string): Promise<void> {
    this.busy.set(true);
    try {
      this.data.set(await action());
      if (successKey) this.toast.success(this.i18n.t(successKey));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(false);
    }
  }

  protected saveAttempt(): void {
    if (this.answer.invalid || !this.answer.value.trim()) { this.answer.markAsTouched(); return; }
    void this.run(() => this.api.saveAttempt(Number(this.id()), this.answer.value), 'practice.attemptSaved');
    this.answer.markAsPristine();
  }

  protected revealHint(): void { void this.run(() => this.api.revealHint(Number(this.id()))); }
  protected revealSolution(): void { void this.run(() => this.api.revealSolution(Number(this.id()))); }
  protected complete(): void { void this.run(() => this.api.setExerciseStatus(Number(this.id()), 'Completed'), 'practice.completed'); }

  protected async reset(): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('practice.resetConfirm'), confirmText: this.i18n.t('practice.resetExercise') }))) return;
    await this.run(() => this.api.setExerciseStatus(Number(this.id()), 'NotStarted'));
    this.answer.reset('');
  }
}

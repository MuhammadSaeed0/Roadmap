import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { DurationPipe, FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ExerciseDetail, ExerciseRunner, WorkspaceFile, WorkspaceKind } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { IdeComponent, TestSummary } from '../../shared/ide/ide.component';
import { ErrorStateComponent, SkeletonComponent } from '../../shared/ui.components';
import { TYPE_ICONS } from './practice.page';

const RUNNER_KIND: Record<Exclude<ExerciseRunner, 'None'>, WorkspaceKind> = {
  CSharp: 'CSharp', Sql: 'Sql', JavaScript: 'JavaScript', TypeScript: 'TypeScript', Web: 'Web', Angular: 'Angular',
};

/** The editor kind for an exercise: its runner, or (for code that doesn't run in the browser) its files' language. */
export function workspaceKindFor(runner: ExerciseRunner, files: WorkspaceFile[]): WorkspaceKind {
  if (runner !== 'None') return RUNNER_KIND[runner];
  const ext = (p: string) => p.slice(p.lastIndexOf('.') + 1);
  if (files.some(f => ext(f.path) === 'cs')) return 'CSharp';
  if (files.some(f => ext(f.path) === 'sql')) return 'Sql';
  if (files.some(f => f.path.includes('/app/') && ext(f.path) === 'ts')) return 'Angular';
  if (files.some(f => ext(f.path) === 'ts')) return 'TypeScript';
  if (files.some(f => ext(f.path) === 'html')) return 'Web';
  return 'JavaScript';
}

const CODE_LANGUAGE: Record<string, string> = { cs: 'csharp', ts: 'typescript', js: 'javascript', sql: 'sql', html: 'html', css: 'css', json: 'json' };

@Component({
  selector: 'app-exercise-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, FormatDatePipe,
    CodeBlockComponent, SkeletonComponent, ErrorStateComponent, IdeComponent],
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
  /** The editor's files: set when the exercise loads, on reset, never on every save (that would move the cursor). */
  protected readonly workspaceFiles = signal<WorkspaceFile[]>([]);
  protected readonly saveState = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  private latestFiles: WorkspaceFile[] = [];

  protected readonly hasWorkspace = computed(() => {
    const d = this.data.value();
    return !!d && (d.summary.runner !== 'None' || d.starterFiles.length > 0);
  });
  protected readonly kind = computed(() => {
    const d = this.data.value();
    return d ? workspaceKindFor(d.summary.runner, d.starterFiles) : 'CSharp';
  });
  protected readonly entry = computed(() => {
    const files = this.workspaceFiles().map(f => f.path);
    return files.find(p => /(^|\/)(Program\.cs|query\.sql|main\.ts|main\.js|index\.html)$/.test(p)) ?? files.find(p => !/\.keep$/.test(p)) ?? null;
  });
  protected readonly saveLabel = computed(() => (this.saveState() === 'idle' ? '' : this.i18n.t('practice.saveState.' + this.saveState())));

  protected readonly hints = computed(() => {
    const d = this.data.value();
    if (!d) return [];
    return this.i18n.lang() === 'ar' && d.revealedHintsAr.length === d.revealedHintsEn.length ? d.revealedHintsAr : d.revealedHintsEn;
  });
  protected readonly requirements = computed(() => this.pick('requirementsEn', 'requirementsAr'));
  protected readonly acceptance = computed(() => this.pick('acceptanceEn', 'acceptanceAr'));
  protected readonly bonus = computed(() => this.pick('bonusEn', 'bonusAr'));

  protected readonly tried = computed(() => {
    const d = this.data.value();
    return !!d && (!!d.userAnswer || !!d.savedFiles || d.submissions > 0);
  });

  /** Where the learner is in the Read → Try → Hints → Solution → Complete workflow. */
  protected readonly step = computed(() => {
    const d = this.data.value();
    if (!d) return 0;
    if (d.summary.status === 'Completed') return 4;
    if (d.solutionRevealed) return 3;
    if (d.revealedHintsEn.length > 0) return 2;
    if (this.tried()) return 1;
    return 0;
  });
  protected readonly steps = ['read', 'investigate', 'hint', 'solution', 'complete'];

  constructor() {
    effect(() => {
      this.id();
      untracked(async () => {
        await this.data.reload();
        const d = this.data.value();
        this.answer.reset(d?.userAnswer ?? '');
        this.latestFiles = d?.savedFiles ?? d?.starterFiles ?? [];
        this.workspaceFiles.set(this.latestFiles);
        this.saveState.set(d?.savedFiles ? 'saved' : 'idle');
      });
    });
  }

  private pick(en: 'requirementsEn' | 'acceptanceEn' | 'bonusEn', ar: 'requirementsAr' | 'acceptanceAr' | 'bonusAr'): string[] {
    const d = this.data.value();
    if (!d) return [];
    return this.i18n.lang() === 'ar' && d[ar].length === d[en].length ? d[ar] : d[en];
  }

  protected languageOf(path: string): string {
    return CODE_LANGUAGE[path.slice(path.lastIndexOf('.') + 1)] ?? 'text';
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

  protected async onFilesChanged(files: WorkspaceFile[]): Promise<void> {
    this.latestFiles = files;
    this.saveState.set('saving');
    try {
      this.data.set(await this.api.saveExerciseFiles(Number(this.id()), files));
      if (this.latestFiles === files) this.saveState.set('saved');
    } catch {
      this.saveState.set('error');
    }
  }

  protected async onTestsFinished(result: TestSummary, files: WorkspaceFile[]): Promise<void> {
    try {
      const before = this.data.value()?.summary.status;
      const d = await this.api.submitExercise(Number(this.id()), files, result.passed, result.total);
      this.data.set(d);
      this.saveState.set('saved');
      if (result.passed === result.total && before !== 'Completed') this.toast.success(this.i18n.t('practice.allChecksPassed'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected async resetCode(): Promise<void> {
    const d = this.data.value();
    if (!d || !(await this.confirm.ask({ message: this.i18n.t('practice.resetCodeConfirm'), danger: true, confirmText: this.i18n.t('common.reset') }))) return;
    this.workspaceFiles.set(d.starterFiles.map(f => ({ ...f })));
    await this.onFilesChanged(d.starterFiles);
  }

  protected async toggleCriterion(index: number, checked: boolean): Promise<void> {
    const d = this.data.value();
    if (!d) return;
    const next = checked ? [...d.checkedCriteria, index] : d.checkedCriteria.filter(i => i !== index);
    await this.run(() => this.api.saveExerciseCriteria(Number(this.id()), next));
  }

  protected revealHint(): void { void this.run(() => this.api.revealHint(Number(this.id()))); }
  protected revealSolution(): void { void this.run(() => this.api.revealSolution(Number(this.id()))); }
  protected complete(): void { void this.run(() => this.api.setExerciseStatus(Number(this.id()), 'Completed'), 'practice.completed'); }

  protected async reset(): Promise<void> {
    if (!(await this.confirm.ask({ message: this.i18n.t('practice.resetConfirm'), confirmText: this.i18n.t('practice.resetExercise') }))) return;
    await this.run(() => this.api.setExerciseStatus(Number(this.id()), 'NotStarted'));
    this.answer.reset('');
    const d = this.data.value();
    if (d) { this.workspaceFiles.set(d.starterFiles.map(f => ({ ...f }))); this.saveState.set('idle'); }
  }
}

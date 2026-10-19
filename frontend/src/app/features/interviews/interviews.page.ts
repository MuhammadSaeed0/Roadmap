import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { INTERVIEW_CATEGORIES, InterviewCategory, InterviewQuestion, InterviewRating } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

type Mode = 'study' | 'practice';

@Component({
  selector: 'app-interviews-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, CodeBlockComponent, PageHeaderComponent,
    ProgressBarComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './interviews.page.html',
})
export default class InterviewsPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly categories = INTERVIEW_CATEGORIES;
  protected readonly ratings: InterviewRating[] = ['NeedReview', 'Partial', 'Confident'];
  private readonly query = this.route.snapshot.queryParamMap;

  protected readonly mode = signal<Mode>(this.query.get('mode') === 'practice' ? 'practice' : 'study');
  protected readonly category = signal<InterviewCategory | ''>((this.query.get('category') ?? '') as InterviewCategory | '');
  protected readonly rating = signal<string>('');
  protected readonly focusId = signal<number | null>(Number(this.query.get('question')) || null);
  protected readonly revealed = signal(new Set<number>());
  protected readonly index = signal(0);
  protected readonly busy = signal(false);

  protected readonly data = createLoader(() => this.api.interviews({ category: this.category(), rating: this.rating() }));
  protected readonly questions = computed(() => this.data.value()?.questions ?? []);
  protected readonly current = computed<InterviewQuestion | undefined>(() => this.questions()[this.index()]);
  protected readonly finished = computed(() => this.mode() === 'practice' && this.questions().length > 0 && this.index() >= this.questions().length);

  constructor() {
    // Deep link from a topic page: open and scroll to the question.
    effect(() => {
      const id = this.focusId();
      if (id && this.questions().some(q => q.id === id)) {
        untracked(() => {
          this.reveal(id);
          setTimeout(() => document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
          this.focusId.set(null);
        });
      }
    });
  }

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.index.set(0);
    this.revealed.set(new Set());
    this.syncUrl();
  }

  protected setCategory(category: InterviewCategory | ''): void {
    this.category.set(category);
    this.index.set(0);
    this.syncUrl();
    void this.data.reload();
  }

  protected setRating(rating: string): void {
    this.rating.set(rating);
    this.index.set(0);
    void this.data.reload();
  }

  protected isRevealed(id: number): boolean { return this.revealed().has(id); }

  protected reveal(id: number): void {
    this.revealed.update(s => { const n = new Set(s); n.add(id); return n; });
  }

  protected toggle(id: number): void {
    this.revealed.update(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  protected async rate(q: InterviewQuestion, rating: InterviewRating, advance: boolean): Promise<void> {
    this.busy.set(true);
    try {
      const saved = await this.api.rateQuestion(q.id, rating);
      // Update locally so practice mode keeps its position (a rating filter would otherwise drop the question).
      this.data.update(v => ({ ...v, questions: v.questions.map(x => (x.id === saved.id ? saved : x)) }));
      this.toast.success(this.i18n.t(`rating.${rating}`));
      if (advance) this.index.update(i => i + 1);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(false);
    }
  }

  protected restart(): void {
    this.index.set(0);
    this.revealed.set(new Set());
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      queryParams: { mode: this.mode() === 'practice' ? 'practice' : null, category: this.category() || null },
      replaceUrl: true,
    });
  }
}

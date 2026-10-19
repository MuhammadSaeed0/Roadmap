import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DurationPipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { KnowledgeLevel, Phase, SKILLS, SkillArea, TopicPriority, TopicStatus } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { statusIcon } from '../../shared/status';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

interface Filters { q: string; skill: SkillArea | ''; status: TopicStatus | ''; phaseId: string; priority: TopicPriority | ''; knowledge: KnowledgeLevel | ''; page: number; pageSize: number; }

@Component({
  selector: 'app-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, DurationPipe, PageHeaderComponent,
    SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './library.page.html',
})
export default class LibraryPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly skills = SKILLS;
  protected readonly statuses: TopicStatus[] = ['NotStarted', 'InProgress', 'Completed', 'Skipped'];
  protected readonly priorities: TopicPriority[] = ['Core', 'Important', 'Optional'];
  protected readonly knowledgeLevels: KnowledgeLevel[] = ['Unassessed', 'AlreadyKnow', 'NeedReview', 'NeedToLearn'];
  protected readonly pageSizes = [10, 20, 50];
  protected readonly statusIcon = statusIcon;

  /** Filters live in the URL query string, so a filtered list survives refresh and the back button. */
  protected readonly filters = signal<Filters>(this.readFilters());
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly phases = createLoader<Phase[]>(async () => (await this.api.roadmap()).phases.filter(p => p.topicCount > 0));
  protected readonly data = createLoader(() => {
    const f = this.filters();
    return this.api.topics({ q: f.q, skill: f.skill, status: f.status, phaseId: f.phaseId, priority: f.priority, knowledge: f.knowledge, page: f.page, pageSize: f.pageSize });
  });

  protected readonly range = computed(() => {
    const r = this.data.value();
    if (!r || r.totalCount === 0) return null;
    return { from: (r.page - 1) * r.pageSize + 1, to: Math.min(r.page * r.pageSize, r.totalCount), total: r.totalCount };
  });
  protected readonly hasFilters = computed(() => {
    const f = this.filters();
    return !!(f.q || f.skill || f.status || f.phaseId || f.priority || f.knowledge);
  });

  protected set<K extends keyof Filters>(key: K, value: Filters[K]): void {
    // Any filter change returns to page 1; page changes keep the filters.
    this.filters.update(f => ({ ...f, [key]: value, page: key === 'page' ? (value as number) : 1 }));
    this.syncUrl();
    void this.data.reload();
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.set('q', value.trim()), 300);
  }

  protected clear(): void {
    this.filters.set({ ...this.filters(), q: '', skill: '', status: '', phaseId: '', priority: '', knowledge: '', page: 1 });
    this.syncUrl();
    void this.data.reload();
  }

  private readFilters(): Filters {
    const q = this.route.snapshot.queryParamMap;
    return {
      q: q.get('q') ?? '', skill: (q.get('skill') ?? '') as SkillArea | '', status: (q.get('status') ?? '') as TopicStatus | '',
      phaseId: q.get('phaseId') ?? '', priority: (q.get('priority') ?? '') as TopicPriority | '',
      knowledge: (q.get('knowledge') ?? '') as KnowledgeLevel | '', page: Number(q.get('page') ?? 1) || 1,
      pageSize: Number(q.get('pageSize') ?? 20) || 20,
    };
  }

  private syncUrl(): void {
    const f = this.filters();
    const queryParams: Record<string, string | number | null> = {
      q: f.q || null, skill: f.skill || null, status: f.status || null, phaseId: f.phaseId || null,
      priority: f.priority || null, knowledge: f.knowledge || null, page: f.page > 1 ? f.page : null, pageSize: f.pageSize !== 20 ? f.pageSize : null,
    };
    void this.router.navigate([], { queryParams, replaceUrl: true });
  }
}

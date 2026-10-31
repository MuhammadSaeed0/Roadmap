import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PhaseRef, Resource, ResourceType, SKILLS, SkillArea } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-resources-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, FormatDatePipe, PageHeaderComponent,
    SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'resources.title' | t" [subtitle]="'resources.subtitle' | t">
      <button type="button" class="btn btn-secondary btn-sm" (click)="setAll(true)">{{ 'roadmap.expandAll' | t }}</button>
      <button type="button" class="btn btn-ghost btn-sm" (click)="setAll(false)">{{ 'roadmap.collapseAll' | t }}</button>
      <button type="button" class="btn btn-secondary btn-sm" data-tour="resources-verify" [disabled]="verifying()" (click)="verify()" [title]="'resources.verifyHelp' | t">
        <app-icon name="refresh" [size]="15" [class.spin]="verifying()" /> {{ (verifying() ? 'resources.verifying' : 'resources.verify') | t }}
      </button>
    </app-page-header>

    <section class="card filter-bar" [attr.aria-label]="'common.filters' | t" data-tour="resources-filters">
      <div class="field grow">
        <label for="res-q" class="sr-only">{{ 'resources.searchPlaceholder' | t }}</label>
        <div class="input-icon">
          <app-icon name="search" [size]="16" />
          <input id="res-q" type="search" class="input" [placeholder]="'resources.searchPlaceholder' | t" (input)="onSearch($any($event.target).value)" />
        </div>
      </div>
      <label class="sr-only" for="res-type">{{ 'resources.allTypes' | t }}</label>
      <select id="res-type" class="input" (change)="type.set($any($event.target).value); data.reload()">
        <option value="">{{ 'resources.allTypes' | t }}</option>
        @for (t of types; track t) { <option [value]="t">{{ 'resourceType.' + t | t }}</option> }
      </select>
      <label class="sr-only" for="res-skill">{{ 'library.allSkills' | t }}</label>
      <select id="res-skill" class="input" (change)="skill.set($any($event.target).value); data.reload()">
        <option value="">{{ 'library.allSkills' | t }}</option>
        @for (s of skills; track s) { <option [value]="s">{{ 'skills.' + s | t }}</option> }
      </select>
    </section>

    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="8" [height]="30" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as list) {
      @if (list.length === 0) {
        <app-empty-state icon="link" [title]="'resources.empty' | t" />
      } @else {
        <ol class="timeline" role="list" [class.is-loading]="data.loading()" data-tour="resources-list">
          @for (group of groups(); track group.key) {
            <li class="phase card">
              <button type="button" class="phase-head" (click)="toggle(group.key)" [attr.aria-expanded]="isOpen(group.key)"
                      [attr.aria-controls]="'res-phase-' + group.key">
                <span class="phase-num" aria-hidden="true">{{ group.phase?.order ?? '·' }}</span>
                <span class="phase-info">
                  @if (group.phase; as phase) {
                    <span class="phase-eyebrow">{{ 'roadmap.phase' | t: { n: phase.order } }}</span>
                    <span class="phase-title">{{ phase | loc: 'title' }}</span>
                  } @else {
                    <span class="phase-title">{{ 'resources.general' | t }}</span>
                  }
                </span>
                <span class="phase-stats"><span class="small">{{ 'resources.count' | t: { n: group.items.length } }}</span></span>
                <app-icon name="chevron-down" class="chev" [class.open]="isOpen(group.key)" />
              </button>
              @if (isOpen(group.key)) {
              <div class="phase-body" [id]="'res-phase-' + group.key">
              <div class="grid grid-2 resource-grid">
          @for (r of group.items; track r.id) {
            <article class="card resource-card">
              <div class="resource-card-head">
                <span class="type-pill">{{ 'resourceType.' + r.type | t }}</span>
                <span class="chip chip-sm chip-ghost">{{ 'difficulty.' + r.difficulty | t }}</span>
                <span class="chip chip-sm">{{ (r.isFree ? 'resources.free' : 'resources.paid') | t }}</span>
              </div>
              <h3><a [href]="r.url" target="_blank" rel="noopener noreferrer">{{ r | loc: 'title' }} <app-icon name="external" [size]="14" /></a></h3>
              <p class="small muted"><bdi>{{ r.sourceName }}</bdi> · <span class="url" dir="ltr">{{ host(r.url) }}</span></p>
              <p class="small" [attr.data-verify]="r.verificationStatus">
                <app-icon [name]="r.verificationStatus === 'Verified' ? 'check' : r.verificationStatus === 'Broken' ? 'alert' : 'info'" [size]="13" />
                @if (r.verificationStatus === 'Verified' && r.lastVerifiedAt) { {{ 'resources.lastVerified' | t: { date: (r.lastVerifiedAt | fmtDate) } }} }
                @else { {{ 'verification.' + r.verificationStatus | t }} }
              </p>
              <div class="chips">
                @for (topic of r.topics.slice(0, 4); track topic.id) {
                  <a class="chip chip-sm chip-link" [routerLink]="['/topics', topic.id]">{{ topic | loc: 'title' }}</a>
                }
              </div>
            </article>
          }
              </div>
              </div>
              }
            </li>
          }
        </ol>
      }
    }
  `,
})
export default class ResourcesPage {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly types: ResourceType[] = ['Documentation', 'Tutorial', 'Course', 'Article', 'Reference', 'Tool'];
  protected readonly skills = SKILLS;
  protected readonly type = signal<ResourceType | ''>('');
  protected readonly skill = signal<SkillArea | ''>('');
  protected readonly q = signal('');
  protected readonly verifying = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly data = createLoader(() => this.api.resources({ type: this.type(), skill: this.skill(), q: this.q() }));

  /** Resources by roadmap phase (the phase of their earliest topic), in roadmap order; unlinked ones last. */
  protected readonly groups = computed(() => {
    const byKey = new Map<string, { key: string; phase: PhaseRef | null; items: Resource[] }>();
    for (const r of this.data.value() ?? []) {
      const key = r.phase ? String(r.phase.id) : 'general';
      if (!byKey.has(key)) byKey.set(key, { key, phase: r.phase ?? null, items: [] });
      byKey.get(key)!.items.push(r);
    }
    return [...byKey.values()].sort((a, b) => (a.phase?.order ?? 999) - (b.phase?.order ?? 999));
  });

  /** Phases opened by hand (the first one to begin with); while searching or filtering every group with results is open. */
  private readonly expanded = signal<Set<string> | null>(null);
  private readonly filtering = computed(() => !!(this.q() || this.type() || this.skill()));

  protected isOpen(key: string): boolean {
    if (this.filtering()) return true;
    const open = this.expanded();
    return open ? open.has(key) : key === this.groups()[0]?.key;
  }

  protected toggle(key: string): void {
    const open = new Set(this.expanded() ?? (this.groups()[0] ? [this.groups()[0].key] : []));
    if (this.isOpen(key)) open.delete(key); else open.add(key);
    this.expanded.set(open);
  }

  protected setAll(open: boolean): void {
    this.expanded.set(new Set(open ? this.groups().map(g => g.key) : []));
  }

  protected host(url: string): string {
    try { return new URL(url).host; } catch { return url; }
  }

  protected onSearch(value: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.q.set(value.trim()); void this.data.reload(); }, 300);
  }

  protected async verify(): Promise<void> {
    this.verifying.set(true);
    try {
      const r = await this.api.verifyResources();
      this.toast.success(this.i18n.t('resources.verifyResult', { verified: r.verified, broken: r.broken, unreachable: r.unreachable }));
      await this.data.reload();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.verifying.set(false);
    }
  }
}

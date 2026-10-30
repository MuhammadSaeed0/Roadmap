import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { ResourceType, SKILLS, SkillArea } from '../../core/models';
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
        <div class="grid grid-2" [class.is-loading]="data.loading()" data-tour="resources-list">
          @for (r of list; track r.id) {
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

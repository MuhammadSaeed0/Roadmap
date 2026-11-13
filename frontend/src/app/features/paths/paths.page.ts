import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PathSummary } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-paths-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './paths.css',
  imports: [NgTemplateOutlet, RouterLink, IconComponent, TranslatePipe,
    PageHeaderComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent, ProgressBarComponent],
  template: `
    <app-page-header [title]="'paths.title' | t" [subtitle]="'paths.subtitle' | t">
      <a routerLink="/paths/new" class="btn btn-primary btn-sm"><app-icon name="plus" [size]="15" /> {{ 'paths.create' | t }}</a>
    </app-page-header>

    @if (data.initialLoading()) {
      <div class="grid grid-3">
        @for (i of [1, 2, 3]; track i) { <div class="card"><app-skeleton [rows]="4" /></div> }
      </div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else {
      <h2 class="section-title" data-tour="paths-builtin"><app-icon name="route" /> {{ 'paths.builtIn' | t }}</h2>
      <div class="grid grid-3">
        @for (p of builtIn(); track p.id) {
          <ng-container *ngTemplateOutlet="card; context: { $implicit: p }" />
        }
      </div>

      <h2 class="section-title section-gap" data-tour="paths-mine"><app-icon name="user" /> {{ 'paths.myPaths' | t }}</h2>
      @if (mine().length === 0) {
        <app-empty-state icon="route" [title]="'paths.noPaths' | t" [message]="'paths.noPathsHint' | t">
          <a routerLink="/paths/new" class="btn btn-secondary btn-sm"><app-icon name="plus" [size]="14" /> {{ 'paths.create' | t }}</a>
        </app-empty-state>
      } @else {
        <div class="grid grid-3">
          @for (p of mine(); track p.id) {
            <ng-container *ngTemplateOutlet="card; context: { $implicit: p }" />
          }
        </div>
      }
    }

    <ng-template #card let-p>
      <a [routerLink]="['/paths', p.id]" class="card path-card" [class.is-active]="p.isActivated">
        <div class="path-card-head">
          <span class="path-icon"><app-icon [name]="p.iconName" [size]="20" /></span>
          <h3 class="path-card-title" dir="auto">{{ i18n.pick(p.nameEn, p.nameAr) }}</h3>
          @if (p.isActivated) { <span class="badge badge-success push-end">{{ 'paths.activated' | t }}</span> }
        </div>
        @if (i18n.pick(p.descriptionEn, p.descriptionAr); as desc) { <p class="path-card-desc muted small" dir="auto">{{ desc }}</p> }
        <div class="path-card-foot">
          <div class="row-between tiny muted">
            <span>{{ 'paths.topics' | t:{ n: p.topicCount } }}</span>
            <span>{{ 'paths.progress' | t:{ n: round(p.progressPercent) } }}</span>
          </div>
          <app-progress-bar [value]="p.progressPercent" [small]="true" [tone]="p.progressPercent >= 100 ? 'success' : 'accent'" />
        </div>
      </a>
    </ng-template>
  `,
})
export default class PathsPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);

  protected readonly data = createLoader(() => this.api.paths());
  protected readonly builtIn = computed(() => (this.data.value() ?? []).filter(p => p.isBuiltIn));
  protected readonly mine = computed(() => (this.data.value() ?? []).filter((p: PathSummary) => !p.isBuiltIn));
  protected readonly round = Math.round;
}

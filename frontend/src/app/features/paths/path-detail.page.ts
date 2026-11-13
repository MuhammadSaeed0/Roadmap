import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { PathTopicDto } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, ProgressRingComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-path-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './paths.css',
  imports: [NgTemplateOutlet, RouterLink, IconComponent, TranslatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent, ProgressRingComponent],
  template: `
    @if (data.initialLoading()) {
      <div class="card"><app-skeleton [rows]="8" [height]="24" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as p) {
      <app-page-header [title]="i18n.pick(p.nameEn, p.nameAr)">
        <a routerLink="/paths" class="btn btn-ghost btn-sm"><app-icon name="arrow-left" [size]="15" /> {{ 'paths.title' | t }}</a>
      </app-page-header>

      <section class="card path-hero" data-tour="path-hero">
        <app-progress-ring [value]="percent()" [size]="96" />
        <div class="path-hero-text">
          <p class="row-gap tiny muted">
            <span class="badge">{{ (p.isBuiltIn ? 'paths.builtIn' : 'paths.custom') | t }}</span>
            <span>{{ 'paths.topics' | t:{ n: total() } }}</span>
            <span>{{ 'paths.doneOf' | t:{ done: done(), total: total() } }}</span>
          </p>
          @if (i18n.pick(p.descriptionEn, p.descriptionAr); as desc) { <p class="muted" dir="auto">{{ desc }}</p> }
          <div class="row-gap">
            @if (p.isActivated) {
              <button type="button" class="btn btn-secondary btn-sm" [disabled]="busy()" (click)="setActive(false)">{{ 'paths.deactivate' | t }}</button>
            } @else {
              <button type="button" class="btn btn-primary btn-sm" [disabled]="busy()" (click)="setActive(true)"><app-icon name="play" [size]="14" /> {{ 'paths.activate' | t }}</button>
            }
            @if (nextTopic(); as next) {
              <a class="btn btn-ghost btn-sm" [routerLink]="['/topics', next.topicId]">{{ 'paths.next' | t }}: {{ i18n.pick(next.titleEn, next.titleAr) }}</a>
            }
            @if (isOwner()) {
              <a class="btn btn-ghost btn-sm push-end" [routerLink]="['/paths', p.id, 'edit']"><app-icon name="edit" [size]="14" /> {{ 'common.edit' | t }}</a>
              <button type="button" class="btn btn-ghost btn-sm btn-danger-text" (click)="remove()"><app-icon name="trash" [size]="14" /> {{ 'common.delete' | t }}</button>
            }
          </div>
        </div>
      </section>

      @for (ph of p.phases; track ph.phaseId; let i = $index) {
        <section class="card">
          <h2 class="section-title"><span class="path-step">{{ i + 1 }}</span> {{ i18n.pick(ph.phaseNameEn, ph.phaseNameAr) }}
            <span class="tiny muted push-end">{{ countDone(ph.topics) }}/{{ ph.topics.length }}</span></h2>
          <ul class="path-topics" role="list" data-tour="path-topics">
            @for (t of ph.topics; track t.topicId) {
              <li><ng-container [ngTemplateOutlet]="topic" [ngTemplateOutletContext]="{ $implicit: t }" /></li>
            }
          </ul>
        </section>
      }
      @if (p.topics.length > 0) {
        <section class="card">
          <ul class="path-topics" role="list" data-tour="path-topics">
            @for (t of p.topics; track t.topicId) {
              <li><ng-container [ngTemplateOutlet]="topic" [ngTemplateOutletContext]="{ $implicit: t }" /></li>
            }
          </ul>
        </section>
      }
    }

    <ng-template #topic let-t>
      <a [routerLink]="['/topics', t.topicId]" class="path-topic" [class.is-done]="t.status === 'Completed'">
        <app-icon [name]="t.status === 'Completed' ? 'check-circle' : 'circle'" [size]="17" />
        <span>{{ i18n.pick(t.titleEn, t.titleAr) }}</span>
      </a>
    </ng-template>
  `,
})
export default class PathDetailPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly i18n = inject(I18nService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly data = createLoader(() => this.api.path(this.id));
  protected readonly busy = signal(false);

  private readonly allTopics = computed(() => {
    const p = this.data.value();
    const list = p ? [...p.phases.flatMap(ph => ph.topics), ...p.topics] : [];
    return [...new Map(list.map(t => [t.topicId, t])).values()];
  });
  protected readonly total = computed(() => this.allTopics().length);
  protected readonly done = computed(() => this.allTopics().filter(t => t.status === 'Completed').length);
  protected readonly percent = computed(() => this.total() ? Math.round(100 * this.done() / this.total()) : 0);
  protected readonly nextTopic = computed(() => this.allTopics().find(t => t.status !== 'Completed') ?? null);
  protected readonly isOwner = computed(() => {
    const p = this.data.value();
    return !!p && !p.isBuiltIn && p.creatorId === this.auth.account()?.id;
  });

  protected countDone(topics: PathTopicDto[]) {
    return topics.filter(t => t.status === 'Completed').length;
  }

  protected async setActive(active: boolean) {
    this.busy.set(true);
    try {
      await (active ? this.api.activatePath(this.id) : this.api.deactivatePath(this.id));
      this.data.update(v => ({ ...v, isActivated: active }));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove() {
    if (!(await this.confirm.ask({ message: this.i18n.t('paths.deletePath'), danger: true }))) return;
    try {
      await this.api.deletePath(this.id);
      void this.router.navigate(['/paths']);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }
}

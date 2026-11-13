import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Phase } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

const MAX_TOPICS = 50;
const ICONS = ['route', 'server', 'layers', 'plug', 'monitor', 'database', 'code', 'target', 'flame', 'award'];

@Component({
  selector: 'app-path-create-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './paths.css',
  imports: [RouterLink, IconComponent, TranslatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <app-page-header [title]="'paths.create' | t">
      <a routerLink="/paths" class="btn btn-ghost btn-sm"><app-icon name="arrow-left" [size]="15" /> {{ 'paths.title' | t }}</a>
    </app-page-header>

    <section class="card" data-tour="path-details">
      <div class="grid grid-2 path-form">
        <div class="field">
          <label for="path-name">{{ 'paths.nameLabel' | t }}</label>
          <input id="path-name" class="input" maxlength="150" (input)="name.set($any($event.target).value)" />
        </div>
        <div class="field">
          <span class="label">{{ 'paths.iconLabel' | t }}</span>
          <div class="segmented" role="radiogroup" [attr.aria-label]="'paths.iconLabel' | t">
            @for (i of icons; track i) {
              <button type="button" role="radio" [attr.aria-checked]="icon() === i" [attr.aria-label]="i" [class.active]="icon() === i" (click)="icon.set(i)">
                <app-icon [name]="i" [size]="16" />
              </button>
            }
          </div>
        </div>
      </div>
      <div class="field">
        <label for="path-desc">{{ 'paths.descriptionLabel' | t }} <span class="muted tiny">({{ 'common.optional' | t }})</span></label>
        <textarea id="path-desc" class="input" rows="2" maxlength="1000" (input)="description.set($any($event.target).value)"></textarea>
      </div>
    </section>

    <section class="card" data-tour="path-pick">
      <div class="row-between">
        <h2 class="section-title">{{ 'paths.topicsLabel' | t }}</h2>
        <span class="small" [class.text-danger]="selected().size >= max">{{ selected().size }} / {{ max }}</span>
      </div>
      @if (roadmap.initialLoading()) {
        <app-skeleton [rows]="8" [height]="22" />
      } @else if (roadmap.error()) {
        <app-error-state [error]="roadmap.error()" (retry)="roadmap.reload()" />
      } @else {
        @for (phase of phases(); track phase.id) {
          <fieldset class="path-pick">
            <legend class="row-between">
              <span class="small"><strong>{{ i18n.pick(phase.titleEn, phase.titleAr) }}</strong>
                <span class="muted"> · {{ countIn(phase) }}/{{ phase.topics.length }}</span></span>
              <button type="button" class="btn btn-ghost btn-xs" (click)="toggleAll(phase)">
                {{ (allIn(phase) ? 'common.clear' : 'common.all') | t }}
              </button>
            </legend>
            <div class="path-pick-grid">
              @for (t of phase.topics; track t.id) {
                <label class="check-label">
                  <input type="checkbox" [checked]="selected().has(t.id)" (change)="toggle(t.id)"
                         [disabled]="!selected().has(t.id) && selected().size >= max" />
                  <span>{{ i18n.pick(t.titleEn, t.titleAr) }}</span>
                </label>
              }
            </div>
          </fieldset>
        }
      }
    </section>

    <div class="row-end section-gap">
      <a routerLink="/paths" class="btn btn-ghost">{{ 'common.cancel' | t }}</a>
      <button type="button" class="btn btn-primary" [disabled]="saving() || !canSave()" (click)="submit()">
        {{ (saving() ? 'common.saving' : 'paths.create') | t }}
      </button>
    </div>
  `,
})
export default class PathCreatePage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly max = MAX_TOPICS;
  protected readonly icons = ICONS;
  protected readonly roadmap = createLoader(() => this.api.roadmap());
  protected readonly phases = computed(() => (this.roadmap.value()?.phases ?? []).filter(p => p.topics.length > 0));
  protected readonly selected = signal(new Set<number>());
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly icon = signal('route');
  protected readonly saving = signal(false);
  protected readonly canSave = computed(() => this.name().trim().length > 0 && this.selected().size > 0);

  protected countIn(phase: Phase) { return phase.topics.filter(t => this.selected().has(t.id)).length; }
  protected allIn(phase: Phase) { return phase.topics.every(t => this.selected().has(t.id)); }

  protected toggle(id: number) {
    this.selected.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else if (next.size < MAX_TOPICS) next.add(id);
      return next;
    });
  }

  protected toggleAll(phase: Phase) {
    const clear = this.allIn(phase);
    this.selected.update(s => {
      const next = new Set(s);
      for (const t of phase.topics) {
        if (clear) next.delete(t.id);
        else if (next.size < MAX_TOPICS) next.add(t.id);
      }
      return next;
    });
  }

  protected async submit() {
    if (!this.canSave()) return;
    const name = this.name().trim();
    const description = this.description().trim();
    this.saving.set(true);
    try {
      const path = await this.api.createPath({
        nameEn: name, nameAr: name, descriptionEn: description, descriptionAr: description,
        iconName: this.icon(), topicIds: [...this.selected()],
      });
      void this.router.navigate(['/paths', path.id]);
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }
}

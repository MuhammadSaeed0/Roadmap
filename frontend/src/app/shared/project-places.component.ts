import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../core/i18n/pipes';
import { IconComponent } from './icon.component';

export type ProjectPlace = 'practice' | 'projects' | 'library';

const PLACES: { key: ProjectPlace; path: string; icon: string }[] = [
  { key: 'projects', path: '/projects', icon: 'folder' },
  { key: 'library', path: '/project-library', icon: 'layers' },
  { key: 'practice', path: '/practice', icon: 'code' },
];

/**
 * One line under the title of the three places where learners build things, saying what this page is for
 * and linking to the other two, so Main Projects, the Project library and Practice are not confused.
 */
@Component({
  selector: 'app-project-places',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe],
  styles: `
    :host { display: block; margin: -4px 0 16px; }
    .places { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin: 0; font-size: 0.9rem; color: var(--text-2); }
    .places strong { color: var(--text); font-weight: 600; }
    .others { display: inline-flex; flex-wrap: wrap; gap: 6px 14px; }
    .others a { display: inline-flex; align-items: center; gap: 6px; }
  `,
  template: `
    <p class="places">
      <span><strong>{{ 'places.' + current() + '.name' | t }}:</strong> {{ 'places.' + current() + '.what' | t }}</span>
      <span class="others">
        @for (p of others(); track p.key) {
          <a [routerLink]="p.path"><app-icon [name]="p.icon" [size]="14" /> {{ 'places.' + p.key + '.link' | t }}</a>
        }
      </span>
    </p>
  `,
})
export class ProjectPlacesComponent {
  readonly current = input.required<ProjectPlace>();
  protected readonly others = computed(() => PLACES.filter(p => p.key !== this.current()));
}

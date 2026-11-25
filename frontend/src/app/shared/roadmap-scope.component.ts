import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { LocalizePipe, TranslatePipe } from '../core/i18n/pipes';
import { TrackStore } from '../core/track.service';
import { IconComponent } from './icon.component';

/**
 * "This roadmap / All roadmaps" for lists of exercises, questions, projects, videos, resources and terms. Lists show
 * the learner's roadmap by default; the switch only appears when there is more than one roadmap to choose from.
 */
@Component({
  selector: 'app-roadmap-scope',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe],
  styles: `:host { display: block; margin: 0 0 16px; } .segmented { flex-wrap: wrap; }`,
  template: `
    @if (store.tracks().length > 1) {
      <div class="segmented" role="group" [attr.aria-label]="'tracks.scopeLabel' | t">
        <button type="button" [class.active]="!all()" [attr.aria-pressed]="!all()" (click)="set(false)">
          <app-icon name="map" [size]="15" />
          @if (store.active(); as active) { {{ active | loc: 'title' }} } @else { {{ 'tracks.scopeMine' | t }} }
        </button>
        <button type="button" [class.active]="all()" [attr.aria-pressed]="all()" (click)="set(true)">
          <app-icon name="layers" [size]="15" /> {{ 'tracks.scopeAll' | t }}
        </button>
      </div>
    }
  `,
})
export class RoadmapScopeComponent {
  protected readonly store = inject(TrackStore);
  /** True for every roadmap's content, false (the default) for the learner's roadmap only. */
  readonly all = model(false);
  /** Emitted after a change, so the page can reload its list. */
  readonly changed = output<boolean>();

  constructor() {
    void this.store.load();
  }

  protected set(value: boolean): void {
    if (value === this.all()) return;
    this.all.set(value);
    this.changed.emit(value);
  }
}

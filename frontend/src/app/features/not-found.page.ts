import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../core/i18n/pipes';
import { EmptyStateComponent } from '../shared/ui.components';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, EmptyStateComponent],
  template: `
    <app-empty-state icon="map" [title]="'notFound.title' | t" [message]="'notFound.body' | t">
      <a routerLink="/" class="btn btn-primary">{{ 'notFound.home' | t }}</a>
    </app-empty-state>
  `,
})
export default class NotFoundPage {}

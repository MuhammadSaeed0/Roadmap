import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { StarRatingComponent } from './components/star-rating/star-rating.component';

@Component({
  selector: 'app-root',
  imports: [StarRatingComponent],
  template: `
    <h1>Rate this course</h1>
    <app-star-rating [value]="rating()" (rated)="rating.set($event)" />
    <p>You rated {{ rating() }}/5</p>
  `,
})
export class AppComponent {
  readonly rating = signal(0);
}

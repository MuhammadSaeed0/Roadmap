import { Component } from '@angular/core';
import { StarRatingComponent } from './components/star-rating/star-rating.component';

@Component({
  selector: 'app-root',
  imports: [StarRatingComponent],
  template: `
    <h1>Rate this course</h1>
    <app-star-rating />
  `,
})
export class AppComponent {}

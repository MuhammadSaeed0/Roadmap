import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    @for (star of stars(); track star) {
      <button type="button" class="star" [attr.aria-label]="star + ' of ' + max() + ' stars'" (click)="rated.emit(star)">
        {{ star <= value() ? '★' : '☆' }}
      </button>
    }
  `,
  styles: [`.star { border: 0; background: none; font-size: 2rem; color: #f59e0b; }`],
})
export class StarRatingComponent {
  readonly value = input(0);
  readonly max = input(5);
  readonly rated = output<number>();
  readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
}

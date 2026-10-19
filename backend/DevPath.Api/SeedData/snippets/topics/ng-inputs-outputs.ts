@Component({
  selector: 'app-product-row',
  template: `
    <span>{{ product().name }}</span>
    <button type="button" (click)="addToCart.emit(product().id)">Add</button>
  `,
})
export class ProductRowComponent {
  readonly product = input.required<Product>();   // data in
  readonly compact = input(false);                 // optional with default
  readonly addToCart = output<number>();           // events out
}

// Parent template:
// <app-product-row [product]="p" (addToCart)="cart.add($event)" />

// Two-way binding with model()
export class RatingComponent {
  readonly rating = model(0);                      // <app-rating [(rating)]="score" />
  rate(value: number) { this.rating.set(value); }
}

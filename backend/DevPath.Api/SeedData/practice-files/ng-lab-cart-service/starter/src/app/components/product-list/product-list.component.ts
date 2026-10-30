import { Component } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  template: `
    @for (p of products; track p.id) {
      <p>{{ p.name }} ({{ p.price }}) <button type="button">Add to cart</button></p>
    }
  `,
})
export class ProductListComponent {
  readonly products: Product[] = [
    { id: 1, name: 'Keyboard', price: 49.99 },
    { id: 2, name: 'Mouse', price: 15.99 },
  ];
}

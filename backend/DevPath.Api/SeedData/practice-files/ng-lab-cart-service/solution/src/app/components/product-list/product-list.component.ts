import { Component, inject } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  template: `
    @for (p of products; track p.id) {
      <p>{{ p.name }} ({{ p.price }}) <button type="button" (click)="cart.add(p)">Add to cart</button></p>
    }
  `,
})
export class ProductListComponent {
  readonly cart = inject(CartService);
  readonly products: Product[] = [
    { id: 1, name: 'Keyboard', price: 49.99 },
    { id: 2, name: 'Mouse', price: 15.99 },
  ];
}

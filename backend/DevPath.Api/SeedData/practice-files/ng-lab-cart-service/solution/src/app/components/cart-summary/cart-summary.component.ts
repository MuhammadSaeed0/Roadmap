import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-summary',
  template: `<aside>Cart: {{ cart.count() }} items, total {{ cart.total() }} <button type="button" (click)="cart.clear()">Clear</button></aside>`,
})
export class CartSummaryComponent {
  readonly cart = inject(CartService);
}

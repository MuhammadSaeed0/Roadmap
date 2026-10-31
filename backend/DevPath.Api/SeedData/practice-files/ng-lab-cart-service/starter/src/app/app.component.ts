import { Component } from '@angular/core';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';

@Component({
  selector: 'app-root',
  imports: [ProductListComponent, CartSummaryComponent],
  template: `
    <h1>Shop</h1>
    <app-cart-summary />
    <app-product-list />
  `,
})
export class AppComponent {}

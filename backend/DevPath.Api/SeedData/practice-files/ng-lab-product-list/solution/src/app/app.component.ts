import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  template: `
    <h1>Products ({{ visible().length }})</h1>
    <label><input type="checkbox" (change)="hideOutOfStock.set($any($event.target).checked)"> Hide out of stock</label>
    <ul>
      @for (product of visible(); track product.id) {
        <li [class.sale]="product.sale">
          {{ product.name }} — {{ product.price | currency }}
          @if (product.stock === 0) { <span class="badge">Out of stock</span> }
        </li>
      } @empty {
        <p>No products</p>
      }
    </ul>
  `,
})
export class AppComponent {
  readonly products = signal([
    { id: 1, name: 'Keyboard', price: 49.99, stock: 12, sale: false },
    { id: 2, name: 'Mouse', price: 15.99, stock: 0, sale: true },
    { id: 3, name: 'Monitor', price: 249, stock: 4, sale: false },
    { id: 4, name: 'Headset', price: 79, stock: 0, sale: false },
    { id: 5, name: 'Webcam', price: 69, stock: 9, sale: true },
  ]);
  readonly hideOutOfStock = signal(false);
  readonly visible = computed(() => this.products().filter(p => !this.hideOutOfStock() || p.stock > 0));
}

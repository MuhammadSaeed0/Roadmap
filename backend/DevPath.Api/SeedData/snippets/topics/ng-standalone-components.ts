import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],               // dependencies of THIS component
  template: `
    <article class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ product().price | currency }}</p>
      @if (product().stock === 0) { <span class="badge">Out of stock</span> }
    </article>
  `,
  styles: `.card { padding: 1rem; border-radius: 12px; }`,
})
export class ProductCardComponent {
  readonly product = input.required<{ name: string; price: number; stock: number }>();
}

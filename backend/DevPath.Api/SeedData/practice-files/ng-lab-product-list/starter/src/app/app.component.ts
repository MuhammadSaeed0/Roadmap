import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  template: `
    <h1>Products</h1>
    <!-- TODO: count, checkbox, list with @for / @if / @empty -->
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
}

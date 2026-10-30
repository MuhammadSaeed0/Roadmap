import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

export interface CartLine extends Product { quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly lines = signal<CartLine[]>([]);
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.quantity, 0));
  readonly total = computed(() => Math.round(this.lines().reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100);

  add(product: Product): void {
    this.lines.update(lines => lines.some(l => l.id === product.id)
      ? lines.map(l => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      : [...lines, { ...product, quantity: 1 }]);
  }

  clear(): void {
    this.lines.set([]);
  }
}

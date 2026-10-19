import { Injectable, computed, signal } from '@angular/core';

export interface CartItem { productId: number; name: string; price: number; quantity: number; }

@Injectable({ providedIn: 'root' })        // one shared instance
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  add(item: CartItem): void {
    this._items.update(items => [...items, item]);
  }

  remove(productId: number): void {
    this._items.update(items => items.filter(i => i.productId !== productId));
  }
}

// In a component:  private readonly cart = inject(CartService);

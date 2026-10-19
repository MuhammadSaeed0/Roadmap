interface Cart {
  add(productId: number, quantity: number): void;
  total(): number;
}

export class ShoppingCart implements Cart {
  private readonly lines = new Map<number, { quantity: number; price: number }>();

  constructor(private readonly prices: Record<number, number>) {}

  add(productId: number, quantity: number): void {
    const existing = this.lines.get(productId)?.quantity ?? 0;
    this.lines.set(productId, { quantity: existing + quantity, price: this.prices[productId] });
  }

  remove(productId: number): void {
    this.lines.delete(productId);
  }

  total(): number {
    let sum = 0;
    for (const { quantity, price } of this.lines.values()) sum += quantity * price;
    return sum;
  }
}

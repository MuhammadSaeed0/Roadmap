interface Line { product: string; price: number; quantity: number; }

class Cart {
  private readonly lines: Line[] = [];

  add(product: string, price: number, quantity = 1): void {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be a whole number of at least 1.");
    if (price < 0) throw new Error("Price can't be negative.");
    const line = this.lines.find(l => l.product === product);
    if (line) line.quantity += quantity;
    else this.lines.push({ product, price, quantity });
  }

  remove(product: string): void {
    const index = this.lines.findIndex(l => l.product === product);
    if (index >= 0) this.lines.splice(index, 1);
  }

  total(): number {
    return Math.round(this.lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
  }

  count(): number {
    return this.lines.reduce((n, l) => n + l.quantity, 0);
  }
}

const cart = new Cart();

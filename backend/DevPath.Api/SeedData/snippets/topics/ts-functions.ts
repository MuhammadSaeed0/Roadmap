interface OrderLine { productId: number; quantity: number; unitPrice: number; }

function lineTotal(line: OrderLine, discount = 0): number {
  return line.quantity * line.unitPrice * (1 - discount);
}

// LINQ → array methods
const expensive = lines.filter(l => l.unitPrice > 100);          // Where
const totals = lines.map(l => lineTotal(l));                      // Select
const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);    // Aggregate / Sum
const sorted = [...lines].sort((a, b) => a.unitPrice - b.unitPrice);  // OrderBy (copy first!)
const hasBig = lines.some(l => l.quantity > 10);                  // Any

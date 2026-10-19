interface Product { id: number; name: string; stock: number; }

export class ProductListComponent {
  readonly products = signal<Product[]>([
    { id: 1, name: 'Keyboard', stock: 4 },
    { id: 2, name: 'Mouse', stock: 0 },
    { id: 3, name: 'Monitor', stock: 9 },
  ]);
  // TODO: search + inStockOnly signals, filtered + count computed
}

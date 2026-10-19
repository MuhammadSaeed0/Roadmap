export class ProductListComponent {
  readonly products = signal<Product[]>([/* ... */]);
  readonly search = signal('');
  readonly inStockOnly = signal(false);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.products().filter(p =>
      (!this.inStockOnly() || p.stock > 0) &&
      (q === '' || p.name.toLowerCase().includes(q)));
  });

  readonly count = computed(() => this.filtered().length);
}

// Template:
// <input [value]="search()" (input)="search.set($any($event.target).value)" />
// <label><input type="checkbox" [checked]="inStockOnly()" (change)="inStockOnly.set(!inStockOnly())" /> In stock only</label>
// <p>{{ count() }} products</p>

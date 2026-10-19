export class ProductListPage {
  private readonly api = inject(ProductsApi);

  readonly q = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly result = signal<PagedResult<ProductDto> | null>(null);

  readonly from = computed(() => (this.page() - 1) * this.pageSize + 1);
  readonly to = computed(() => Math.min(this.page() * this.pageSize, this.result()?.totalCount ?? 0));
  readonly canNext = computed(() => this.to() < (this.result()?.totalCount ?? 0));

  setFilter(categoryId: number | null): void {
    this.categoryId.set(categoryId);
    this.page.set(1);                       // filters changed → back to page 1
    void this.load();
  }

  async load(): Promise<void> {
    this.result.set(await firstValueFrom(
      this.api.list({ q: this.q(), categoryId: this.categoryId(), page: this.page(), pageSize: this.pageSize })));
  }
}

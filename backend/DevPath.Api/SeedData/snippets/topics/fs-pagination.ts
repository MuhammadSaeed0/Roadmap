async remove(id: number): Promise<void> {
  await firstValueFrom(this.api.delete(id));

  const result = this.result();
  // Was this the last item on a page after the first? Go back one page.
  if (result && result.items.length === 1 && this.page() > 1) {
    this.page.update(p => p - 1);
  }
  await this.load();
}

// API contract shared by both sides:
// GET /api/orders?page=1&pageSize=20  →  { items: [...], page: 1, pageSize: 20, totalCount: 143, totalPages: 8 }

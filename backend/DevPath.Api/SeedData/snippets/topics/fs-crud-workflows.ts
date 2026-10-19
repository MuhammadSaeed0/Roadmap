export class CategoriesPage {
  private readonly api = inject(CategoriesApi);
  private readonly toast = inject(ToastService);
  readonly rows = signal<CategoryDto[]>([]);
  readonly saving = signal(false);

  async save(form: { id?: number; name: string }): Promise<void> {
    this.saving.set(true);
    try {
      // Use the server's response as the source of truth
      const saved = form.id
        ? await firstValueFrom(this.api.update(form.id, form))
        : await firstValueFrom(this.api.create(form));
      this.rows.update(rows => {
        const others = rows.filter(r => r.id !== saved.id);
        return [...others, saved].sort((a, b) => a.name.localeCompare(b.name));
      });
      this.toast.show('Saved');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(row: CategoryDto): Promise<void> {
    if (!(await this.confirm.ask(`Delete "${row.name}"?`))) return;
    await firstValueFrom(this.api.delete(row.id));
    this.rows.update(rows => rows.filter(r => r.id !== row.id));
  }
}

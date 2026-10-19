async delete(item: Product): Promise<void> {
  try {
    await firstValueFrom(this.api.deleteProduct(item.id));   // the request is sent here
    this.items.update(list => list.filter(p => p.id !== item.id));
    this.toast.show('Deleted');
  } catch (error) {
    this.toast.error('Could not delete the product.');
  }
}

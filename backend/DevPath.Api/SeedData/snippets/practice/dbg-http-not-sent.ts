async delete(item: Product): Promise<void> {
  this.api.deleteProduct(item.id);          // returns an Observable
  this.items.update(list => list.filter(p => p.id !== item.id));
  this.toast.show('Deleted');
}

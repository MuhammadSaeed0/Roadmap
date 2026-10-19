// DTO includes the version the user is editing
export interface OrderDto { id: number; status: string; rowVersion: string; /* base64 */ }

async save(order: OrderDto, changes: Partial<OrderDto>): Promise<void> {
  try {
    await firstValueFrom(this.api.update(order.id, { ...changes, rowVersion: order.rowVersion }));
    this.toast.show('Saved');
  } catch (error) {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      const reload = await this.confirm.ask('This order was changed by someone else. Reload the latest version?');
      if (reload) await this.load(order.id);
      return;
    }
    throw error;
  }
}

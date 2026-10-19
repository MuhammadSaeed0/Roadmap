export class OrderFormComponent {
  readonly saving = signal(false);

  async submit(): Promise<void> {
    if (this.saving()) return;               // ignore double clicks
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.createOrder(this.form.getRawValue()));
    } finally {
      this.saving.set(false);
    }
  }
}

// Template
// <button type="submit" [disabled]="saving() || form.invalid">
//   @if (saving()) { <span class="spinner" aria-hidden="true"></span> Saving… } @else { Place order }
// </button>

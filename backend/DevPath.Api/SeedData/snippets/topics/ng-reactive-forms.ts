import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label for="name">Name</label>
      <input id="name" formControlName="name" />
      @if (form.controls.name.touched && form.controls.name.hasError('required')) {
        <small class="error">Name is required.</small>
      }

      <label for="price">Price</label>
      <input id="price" type="number" formControlName="price" />

      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());   // { name: string; price: number }
  }
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" />
      <input type="number" formControlName="price" />        <!-- name matches the control -->
      @if (form.controls.price.touched && form.controls.price.hasError('required')) {
        <small>Price is required</small>
      }
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  readonly form = inject(FormBuilder).group({
    name: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],   // sync validators = 2nd item
  });
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());
  }
}

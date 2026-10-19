@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" />
      <input type="number" formControlName="Price" />
      @if (form.controls.price.touched && form.controls.price.hasError('required')) {
        <small>Price is required</small>
      }
      <button type="submit">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  readonly form = inject(FormBuilder).group({
    name: ['', Validators.required],
    price: [null, null, [Validators.required, Validators.min(0.01)]],
  });
  save() { console.log(this.form.value); }
}

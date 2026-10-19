@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="name">Name</label>
      <input id="name" formControlName="name" aria-describedby="name-error" />
      @if (form.controls.name.touched && form.controls.name.invalid) {
        <small id="name-error" class="error">Name is required (max 80 characters).</small>
      }

      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" aria-describedby="email-error" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <small id="email-error" class="error">Enter a valid email.</small>
      }

      <label for="phone">Phone (optional)</label>
      <input id="phone" inputmode="numeric" formControlName="phone" />

      <button type="submit" [disabled]="form.invalid || saving()">Save</button>
    </form>
  `,
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(/^[0-9]*$/)],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    console.log(this.form.getRawValue());
  }
}

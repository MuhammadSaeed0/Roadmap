import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

const matching: ValidatorFn = group =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule],
  template: `
    @if (welcome()) { <p class="ok">{{ welcome() }}</p> }
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name <input formControlName="name"></label>
      @if (form.controls.name.touched && form.controls.name.invalid) { <small>Enter at least 2 characters.</small> }
      <label>Email <input formControlName="email" type="email"></label>
      @if (form.controls.email.touched && form.controls.email.hasError('required')) { <small>Email is required.</small> }
      @if (form.controls.email.touched && form.controls.email.hasError('email')) { <small>Enter a valid email.</small> }
      <label>Password <input formControlName="password" type="password"></label>
      @if (form.controls.password.touched && form.controls.password.hasError('minlength')) { <small>At least 8 characters.</small> }
      @if (form.controls.password.touched && form.controls.password.hasError('pattern')) { <small>Include at least one digit.</small> }
      <label>Confirm password <input formControlName="confirm" type="password"></label>
      @if (form.controls.confirm.touched && form.hasError('mismatch')) { <small>Passwords don't match.</small> }
      <button type="submit" [disabled]="form.invalid">Sign up</button>
    </form>
  `,
  styles: [`form { display: grid; gap: .4rem; max-width: 320px; } small { color: #c62828; } .ok { color: #047857; }`],
})
export class SignupFormComponent {
  readonly welcome = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/\d/)]],
    confirm: ['', Validators.required],
  }, { validators: matching });

  submit(): void {
    if (this.form.invalid) return;
    this.welcome.set(`Welcome, ${this.form.getRawValue().name}!`);
    this.form.reset();
  }
}

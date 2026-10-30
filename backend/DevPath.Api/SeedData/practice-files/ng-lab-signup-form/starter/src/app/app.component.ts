import { Component } from '@angular/core';
import { SignupFormComponent } from './components/signup-form/signup-form.component';

@Component({
  selector: 'app-root',
  imports: [SignupFormComponent],
  template: `
    <h1>Create an account</h1>
    <app-signup-form />
  `,
})
export class AppComponent {}

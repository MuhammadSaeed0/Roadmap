import { Component } from '@angular/core';
import { UsersComponent } from './components/users/users.component';

@Component({
  selector: 'app-root',
  imports: [UsersComponent],
  template: `
    <h1>Users</h1>
    <app-users />
  `,
})
export class AppComponent {}

import { Component, computed, inject, signal } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  template: `
    <input placeholder="Search by name" (input)="search.set($any($event.target).value)">
    @if (loading()) {
      <p>Loading users…</p>
    } @else if (error()) {
      <p class="error">Couldn't load the users. <button type="button" (click)="load()">Retry</button></p>
    } @else {
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>City</th></tr></thead>
        <tbody>
          @for (u of visible(); track u.id) {
            <tr><td>{{ u.name }}</td><td>{{ u.email }}</td><td>{{ u.address.city }}</td></tr>
          } @empty {
            <tr><td colspan="3">No users match.</td></tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`table { border-collapse: collapse; margin-top: 1rem; } td, th { padding: .3rem .7rem; border-bottom: 1px solid #ddd; text-align: left; } .error { color: #c62828; }`],
})
export class UsersComponent {
  private readonly service = inject(UserService);
  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly search = signal('');
  readonly visible = computed(() => this.users().filter(u => u.name.toLowerCase().includes(this.search().toLowerCase())));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}

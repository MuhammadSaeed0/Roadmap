import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-profile-card',
  template: `
    <article class="card">
      <span class="avatar">{{ initials() }}</span>
      <div>
        <h2>{{ name() }}</h2>
        <p>{{ role() }}</p>
        <a [href]="'mailto:' + email()">{{ email() }}</a>
      </div>
    </article>
  `,
  styles: [`.card { display: flex; gap: 1rem; align-items: center; background: white; padding: 1rem; border-radius: 12px; margin-bottom: .75rem; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: #4f46e5; color: white; display: grid; place-items: center; font-weight: 700; }
    h2 { margin: 0; font-size: 1.05rem; } p { margin: .2rem 0; color: #6b7280; }`],
})
export class ProfileCardComponent {
  readonly name = input.required<string>();
  readonly role = input.required<string>();
  readonly email = input.required<string>();
  readonly initials = computed(() => this.name().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase());
}

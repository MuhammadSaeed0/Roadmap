import { Component } from '@angular/core';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';

@Component({
  selector: 'app-root',
  imports: [ProfileCardComponent],
  template: `
    <h1>Team</h1>
    <app-profile-card name="Sara Ahmed" role="Frontend developer" email="sara@example.com" />
    <app-profile-card name="Omar Khaled" role="Backend developer" email="omar@example.com" />
    <app-profile-card name="Mona Hassan" role="Designer" email="mona@example.com" />
  `,
})
export class AppComponent {}

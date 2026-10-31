import { Component } from '@angular/core';
import { SearchBoxComponent } from './components/search-box/search-box.component';

@Component({
  selector: 'app-root',
  imports: [SearchBoxComponent],
  template: `
    <h1>Search</h1>
    <app-search-box />
  `,
})
export class AppComponent {}

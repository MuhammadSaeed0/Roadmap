import { Component, inject } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-box',
  template: `<input placeholder="Search topics"><!-- TODO -->`,
})
export class SearchBoxComponent {
  readonly search = inject(SearchService);
}

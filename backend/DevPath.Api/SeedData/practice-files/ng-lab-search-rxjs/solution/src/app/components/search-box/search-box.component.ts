import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-box',
  template: `
    <input placeholder="Search topics" (input)="terms.next($any($event.target).value.trim())">
    @if (searching()) { <p>Searching…</p> }
    <ul>@for (r of results(); track r) { <li>{{ r }}</li> }</ul>
    <p><small>Requests made: {{ search.requests }}</small></p>
  `,
})
export class SearchBoxComponent {
  readonly search = inject(SearchService);
  readonly terms = new Subject<string>();
  readonly searching = signal(false);
  readonly results = toSignal(this.terms.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    tap(() => this.searching.set(true)),
    switchMap(term => this.search.search(term).pipe(finalize(() => this.searching.set(false)))),
  ), { initialValue: [] as string[] });
}

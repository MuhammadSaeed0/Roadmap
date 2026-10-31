import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

const TOPICS = ['Angular signals', 'Angular routing', 'Angular forms', 'ASP.NET Core', 'C# records', 'C# LINQ', 'SQL joins', 'SQL indexes', 'TypeScript generics', 'RxJS operators'];

@Injectable({ providedIn: 'root' })
export class SearchService {
  requests = 0;

  search(term: string): Observable<string[]> {
    this.requests++;
    return of(TOPICS.filter(t => t.toLowerCase().includes(term.toLowerCase()))).pipe(delay(300));
  }
}

import { debounceTime, distinctUntilChanged, switchMap, catchError, of, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export class ProductSearchComponent {
  private readonly api = inject(ProductsApi);
  readonly search = new FormControl('', { nonNullable: true });

  readonly results = toSignal(
    this.search.valueChanges.pipe(
      debounceTime(300),                 // wait until typing pauses
      distinctUntilChanged(),            // ignore same value
      filter(q => q.length === 0 || q.length >= 2),
      switchMap(q =>                     // cancel the previous request
        this.api.search(q).pipe(catchError(() => of([])))
      ),
    ),
    { initialValue: [] as ProductDto[] },
  );
}

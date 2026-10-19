this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q)),   // previous request is cancelled
).subscribe(results => this.results.set(results));

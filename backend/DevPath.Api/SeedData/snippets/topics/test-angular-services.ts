import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

describe('ProductsApi', () => {
  it('requests the right page', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const api = TestBed.inject(ProductsApi);
    const http = TestBed.inject(HttpTestingController);

    const promise = firstValueFrom(api.list(2));
    const req = http.expectOne(r => r.url.endsWith('/products') && r.params.get('page') === '2');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], page: 2, pageSize: 20, totalCount: 0 });

    expect((await promise).page).toBe(2);
    http.verify();   // no unexpected requests
  });
});

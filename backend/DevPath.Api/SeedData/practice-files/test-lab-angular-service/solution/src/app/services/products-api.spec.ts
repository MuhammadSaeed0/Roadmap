import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductsApi } from './products-api';

describe('ProductsApi', () => {
  let api: ProductsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ProductsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the given page', () => {
    let total = 0;
    api.list(2).subscribe(page => (total = page.total));
    const req = httpMock.expectOne(r => r.url === '/api/products' && r.params.get('page') === '2');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 42 });
    expect(total).toBe(42);
  });

  it('posts the new product', () => {
    api.create({ name: 'Mouse', price: 15.99 }).subscribe();
    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Mouse', price: 15.99 });
    req.flush({ id: 1, name: 'Mouse', price: 15.99 });
  });

  it('turns a 400 into a friendly message', () => {
    let message = '';
    api.create({ name: '', price: 0 }).subscribe({ error: (e: Error) => (message = e.message) });
    httpMock.expectOne('/api/products').flush({ errors: { Name: ['Name is required.'] } }, { status: 400, statusText: 'Bad Request' });
    expect(message).toBe('Please check the highlighted fields.');
  });
});

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:5080/api/products';

  list(page = 1) {
    return this.http.get<PagedResult<ProductDto>>(this.url, { params: { page } });
  }
  get(id: number)                         { return this.http.get<ProductDto>(`${this.url}/${id}`); }
  create(body: CreateProductRequest)      { return this.http.post<ProductDto>(this.url, body); }
  update(id: number, body: UpdateProductRequest) { return this.http.put<void>(`${this.url}/${id}`, body); }
  delete(id: number)                      { return this.http.delete<void>(`${this.url}/${id}`); }
}

// A functional interceptor
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(I18nService).lang();
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};

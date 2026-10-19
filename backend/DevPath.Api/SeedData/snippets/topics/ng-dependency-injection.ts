import { InjectionToken, inject } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// app.config.ts
providers: [{ provide: API_BASE_URL, useValue: 'http://localhost:5080/api' }];

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list() { return this.http.get<ProductDto[]>(`${this.baseUrl}/products`); }
}

// Component-level provider: every instance gets its own EditorState
@Component({ selector: 'app-editor', providers: [EditorState], template: '' })
export class EditorComponent {}

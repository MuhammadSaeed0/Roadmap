import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface Product { id: number; name: string; price: number; }
export interface Page<T> { items: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);

  list(page: number): Observable<Page<Product>> {
    return this.http.get<Page<Product>>('/api/products', { params: { page } });
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>('/api/products', product).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(
        e.status === 400 ? 'Please check the highlighted fields.' : 'Something went wrong. Try again.'))),
    );
  }
}

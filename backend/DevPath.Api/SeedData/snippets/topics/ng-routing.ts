// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', loadComponent: () => import('./features/products/product-list.page') },
  { path: 'products/:id', loadComponent: () => import('./features/products/product-detail.page') },
  { path: '**', loadComponent: () => import('./features/not-found.page') },
];

// app.config.ts:  provideRouter(routes, withComponentInputBinding())

// product-detail.page.ts — the :id route parameter arrives as an input
export default class ProductDetailPage {
  readonly id = input.required<string>();
}

// Template links
// <a routerLink="/products/42">Details</a>
// <a [routerLink]="['/products']" [queryParams]="{ page: 2 }">Page 2</a>

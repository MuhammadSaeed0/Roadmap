// Adds the token to every API request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) inject(Router).navigate(['/login']);   // expired or missing
      return throwError(() => error);
    }),
  );
};

// Protects routes in the UI (the API must STILL check authorization!)
export const authGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);

// { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./orders.page') }

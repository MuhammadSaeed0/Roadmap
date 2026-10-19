export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const i18n = inject(I18nService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const code = error.error?.code as string | undefined;
      if (error.status === 0) toast.error(i18n.t('errors.offline'));
      else if (error.status >= 500) toast.error(i18n.t('errors.server'));
      else if (error.status === 409 && code) toast.error(i18n.t(`errors.codes.${code}`));
      // 400 is handled by the form, 404 by the page
      return throwError(() => error);
    }),
  );
};

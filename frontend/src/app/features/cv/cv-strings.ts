import { inject } from '@angular/core';
import { ApiError } from '../../core/api-error';
import { I18nService, registerTranslations } from '../../core/i18n/i18n.service';
import { cvAr } from './cv.ar';
import { cvEn } from './cv.en';

// Imported for its effect by the CV pages: their strings load with them, not with the app's first download.
registerTranslations(cvEn, cvAr);

/** A message for a failed CV request: the CV builder's own error codes first, then the app's. */
export function cvErrorMessage(i18n: I18nService, error: unknown): string {
  const e = ApiError.from(error);
  return i18n.has(`cv.errors.${e.code}`) ? i18n.t(`cv.errors.${e.code}`) : i18n.errorMessage(e);
}

/** Same, for components that don't otherwise need the I18nService. */
export function useCvErrors(): (error: unknown) => string {
  const i18n = inject(I18nService);
  return error => cvErrorMessage(i18n, error);
}

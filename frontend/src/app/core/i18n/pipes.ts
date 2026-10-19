import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

// These pipes are impure (pure: false) on purpose: their output depends on the
// current language signal, not only on their inputs. They are cheap lookups.

/** {{ 'nav.dashboard' | t }}  ·  {{ 'common.minutes' | t: { n: 30 } }} */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(key: string, params?: Record<string, string | number | null | undefined>): string {
    return this.i18n.t(key, params);
  }
}

/** {{ topic | loc: 'title' }} → topic.titleEn or topic.titleAr */
@Pipe({ name: 'loc', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(obj: object | null | undefined, field: string): string {
    return this.i18n.loc(obj, field);
  }
}

/** {{ value | fmtDate: 'short' }} */
@Pipe({ name: 'fmtDate', pure: false })
export class FormatDatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: string | Date | null | undefined, style: 'short' | 'medium' | 'long' = 'medium'): string {
    return this.i18n.formatDate(value, style);
  }
}

/** {{ 3.14159 | fmtNum: 1 }} */
@Pipe({ name: 'fmtNum', pure: false })
export class FormatNumberPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number | null | undefined, digits = 0): string {
    return value === null || value === undefined ? '' : this.i18n.formatNumber(value, digits);
  }
}

/** {{ 95 | duration }} → "1 h 35 min" */
@Pipe({ name: 'duration', pure: false })
export class DurationPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(minutes: number | null | undefined): string {
    return minutes === null || minutes === undefined ? '' : this.i18n.formatDuration(minutes);
  }
}

export const I18N_PIPES = [TranslatePipe, LocalizePipe, FormatDatePipe, FormatNumberPipe, DurationPipe] as const;

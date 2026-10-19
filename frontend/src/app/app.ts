import { Component, inject } from '@angular/core';
import { I18nService } from './core/i18n/i18n.service';
import { ThemeService } from './core/ui-services';
import { ShellComponent } from './layout/shell.component';

@Component({
  selector: 'app-root',
  imports: [ShellComponent],
  template: `<app-shell />`,
})
export class App {
  // Injected here so language direction and theme are applied before the first render.
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
}

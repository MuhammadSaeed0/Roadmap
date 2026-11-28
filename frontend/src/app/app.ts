import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { ThemeService } from './core/ui-services';
import { ShellComponent } from './layout/shell.component';

@Component({
  selector: 'app-root',
  imports: [ShellComponent],
  template: `
    @if (navigating()) { <div class="nav-progress" role="progressbar" [attr.aria-label]="i18n.t('common.loading')"></div> }
    <app-shell />
  `,
  styles: `
    .nav-progress { position: fixed; inset-block-start: 0; inset-inline: 0; height: 3px; z-index: 1000; overflow: hidden; pointer-events: none; }
    .nav-progress::after { content: ''; position: absolute; inset-block: 0; width: 40%; background: var(--accent);
      animation: nav-progress 1.1s ease-in-out infinite; }
    @keyframes nav-progress { from { inset-inline-start: -40%; } to { inset-inline-start: 100%; } }
    @media (prefers-reduced-motion: reduce) { .nav-progress::after { animation: none; width: 100%; opacity: .6; } }
  `,
})
export class App {
  // Injected here so language direction and theme are applied before the first render.
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  /** True while a navigation (usually a page's code downloading) takes longer than a moment. */
  protected readonly navigating = signal(false);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = inject(Router).events.subscribe(e => {
      if (e instanceof NavigationStart) { clearTimeout(timer); timer = setTimeout(() => this.navigating.set(true), 150); }
      else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        clearTimeout(timer);
        this.navigating.set(false);
      }
    });
    inject(DestroyRef).onDestroy(() => { clearTimeout(timer); sub.unsubscribe(); });
  }
}

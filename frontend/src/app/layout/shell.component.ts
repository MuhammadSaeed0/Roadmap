import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/pipes';
import { ThemeService } from '../core/ui-services';
import { IconComponent } from '../shared/icon.component';
import { ConfirmDialogComponent, ToastHostComponent } from '../shared/ui.components';
import { GlobalSearchComponent } from './global-search.component';
import { SessionDialogComponent, SessionDialogService } from './session-dialog.component';

interface NavItem { path: string; key: string; icon: string; }

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TranslatePipe, GlobalSearchComponent,
    ToastHostComponent, ConfirmDialogComponent, SessionDialogComponent],
  template: `
    <a class="skip-link" href="#main">{{ 'common.skipToContent' | t }}</a>

    <div class="shell" [class.nav-open]="navOpen()">
      <aside class="sidebar" id="sidebar" [attr.aria-label]="'common.menu' | t">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="var(--accent)" /><stop offset="1" stop-color="var(--accent-2)" /></linearGradient></defs>
              <rect width="32" height="32" rx="9" fill="url(#bg)" />
              <path d="M9 21.5 14 16l-5-5.5M16.5 22h7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="brand-text">
            <strong>{{ 'app.name' | t }}</strong>
            <small>{{ 'app.tagline' | t }}</small>
          </span>
          <button type="button" class="icon-btn nav-close" (click)="navOpen.set(false)" [attr.aria-label]="'common.closeMenu' | t">
            <app-icon name="x" />
          </button>
        </div>

        <nav class="nav">
          @for (group of groups; track group.key) {
            <p class="nav-group">{{ group.key | t }}</p>
            <ul role="list">
              @for (item of group.items; track item.path) {
                <li>
                  <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                     (click)="navOpen.set(false)" #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">
                    <app-icon [name]="item.icon" />
                    <span>{{ item.key | t }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        </nav>
      </aside>
      <div class="scrim" (click)="navOpen.set(false)" aria-hidden="true"></div>

      <div class="main-col">
        <header class="topbar">
          <button type="button" class="icon-btn menu-btn" (click)="navOpen.set(true)" [attr.aria-label]="'common.menu' | t"
                  aria-controls="sidebar" [attr.aria-expanded]="navOpen()">
            <app-icon name="menu" />
          </button>
          <div class="crumb">
            <span class="crumb-root">{{ 'app.name' | t }}</span>
            <app-icon name="chevron-right" [size]="14" />
            <span class="crumb-current">{{ titleKey() | t }}</span>
          </div>

          <app-global-search class="topbar-search" />

          <div class="topbar-actions">
            <div class="menu-wrap">
              <button type="button" class="btn btn-primary btn-sm quick-add" (click)="quickOpen.set(!quickOpen())"
                      aria-haspopup="menu" [attr.aria-expanded]="quickOpen()">
                <app-icon name="plus" [size]="16" /><span class="hide-sm">{{ 'quickAdd.title' | t }}</span>
              </button>
              @if (quickOpen()) {
                <div class="menu" role="menu">
                  <button type="button" role="menuitem" (click)="newNote()"><app-icon name="note" [size]="16" /> {{ 'quickAdd.note' | t }}</button>
                  <button type="button" role="menuitem" (click)="logSession()"><app-icon name="clock" [size]="16" /> {{ 'quickAdd.session' | t }}</button>
                </div>
              }
            </div>

            <div class="lang-switch" role="group" [attr.aria-label]="'common.language' | t">
              <button type="button" [class.active]="i18n.lang() === 'en'" [attr.aria-pressed]="i18n.lang() === 'en'"
                      (click)="i18n.setLang('en')" lang="en">EN</button>
              <button type="button" [class.active]="i18n.lang() === 'ar'" [attr.aria-pressed]="i18n.lang() === 'ar'"
                      (click)="i18n.setLang('ar')" lang="ar">العربية</button>
            </div>

            <button type="button" class="icon-btn" (click)="theme.toggle()"
                    [attr.aria-label]="(theme.resolved() === 'dark' ? 'common.light' : 'common.dark') | t"
                    [title]="(theme.resolved() === 'dark' ? 'common.light' : 'common.dark') | t">
              <app-icon [name]="theme.resolved() === 'dark' ? 'sun' : 'moon'" />
            </button>
          </div>
        </header>

        @if (apiOffline()) {
          <div class="offline-banner" role="alert">
            <app-icon name="wifi" />
            <div><strong>{{ 'apiBanner.title' | t }}</strong> <span>{{ 'apiBanner.body' | t }}</span></div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="checkHealth()">{{ 'apiBanner.retry' | t }}</button>
          </div>
        }

        <main id="main" class="content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast-host />
    <app-confirm-dialog />
    <app-session-dialog />
  `,
})
export class ShellComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sessions = inject(SessionDialogService);

  protected readonly navOpen = signal(false);
  protected readonly quickOpen = signal(false);
  protected readonly apiOffline = signal(false);
  protected readonly titleKey = signal('nav.dashboard');

  protected readonly groups: { key: string; items: NavItem[] }[] = [
    { key: 'nav.learn', items: [
      { path: '/', key: 'nav.dashboard', icon: 'dashboard' },
      { path: '/roadmap', key: 'nav.roadmap', icon: 'map' },
      { path: '/library', key: 'nav.library', icon: 'book' },
      { path: '/resources', key: 'nav.resources', icon: 'link' },
    ] },
    { key: 'nav.build', items: [
      { path: '/projects', key: 'nav.projects', icon: 'folder' },
      { path: '/practice', key: 'nav.practice', icon: 'code' },
      { path: '/interviews', key: 'nav.interviews', icon: 'chat' },
      { path: '/notes', key: 'nav.notes', icon: 'note' },
    ] },
    { key: 'nav.track', items: [
      { path: '/progress', key: 'nav.progress', icon: 'chart' },
      { path: '/career', key: 'nav.career', icon: 'briefcase' },
      { path: '/settings', key: 'nav.settings', icon: 'settings' },
    ] },
  ];

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      let r = this.route;
      while (r.firstChild) r = r.firstChild;
      this.titleKey.set((r.snapshot.data['titleKey'] as string) ?? 'app.name');
      this.quickOpen.set(false);
    });
    void this.checkHealth();
  }

  protected async checkHealth(): Promise<void> {
    try {
      await this.api.health();
      this.apiOffline.set(false);
    } catch {
      this.apiOffline.set(true);
    }
  }

  protected newNote(): void {
    this.quickOpen.set(false);
    void this.router.navigate(['/notes'], { queryParams: { new: 1 } });
  }

  protected logSession(): void {
    this.quickOpen.set(false);
    this.sessions.open();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest?.('.menu-wrap')) this.quickOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.quickOpen.set(false);
    this.navOpen.set(false);
  }
}

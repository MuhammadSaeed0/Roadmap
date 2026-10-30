import { Location, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/pipes';
import { AuthService } from '../core/auth.service';
import { isHelpId } from '../core/tour/tour.config';
import { TourService } from '../core/tour/tour.service';
import { ThemeService, ToastService } from '../core/ui-services';
import { IconComponent } from '../shared/icon.component';
import { ConfirmDialogComponent, ToastHostComponent } from '../shared/ui.components';
import { GlobalSearchComponent } from './global-search.component';
import { SessionDialogComponent, SessionDialogService } from './session-dialog.component';
import { HelpMenuComponent } from './tour/help-menu.component';
import { TourOverlayComponent } from './tour/tour-overlay.component';
import { TourWelcomeComponent } from './tour/tour-welcome.component';

interface NavItem { path: string; key: string; icon: string; }

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TranslatePipe, GlobalSearchComponent,
    ToastHostComponent, ConfirmDialogComponent, SessionDialogComponent, HelpMenuComponent, TourOverlayComponent, TourWelcomeComponent],
  template: `
    <a class="skip-link" href="#main">{{ 'common.skipToContent' | t }}</a>

    <div class="shell" [class.nav-open]="navOpen()" [class.auth-layout]="authLayout()">
      @if (!authLayout()) {
      <aside class="sidebar" id="sidebar" [attr.aria-label]="'common.menu' | t">
        <div class="brand">
          <a class="brand-link" routerLink="/" (click)="navOpen.set(false)" [attr.aria-label]="'nav.dashboard' | t" [title]="'nav.dashboard' | t">
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
          </a>
          <button type="button" class="icon-btn nav-close" (click)="navOpen.set(false)" [attr.aria-label]="'common.closeMenu' | t">
            <app-icon name="x" />
          </button>
        </div>

        <nav class="nav" data-tour="nav">
          @for (group of groups(); track group.key) {
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
      }

      <div class="main-col">
        @if (authLayout()) {
          <header class="topbar auth-topbar">
            <span class="brand auth-brand">
              <span class="brand-text"><strong>{{ 'app.name' | t }}</strong><small>{{ 'app.tagline' | t }}</small></span>
            </span>
            <div class="topbar-actions">
              <ng-container *ngTemplateOutlet="prefs" />
            </div>
          </header>
        } @else {
        <header class="topbar">
          <button type="button" class="icon-btn menu-btn" data-tour="menu" (click)="navOpen.set(true)" [attr.aria-label]="'common.menu' | t"
                  aria-controls="sidebar" [attr.aria-expanded]="navOpen()">
            <app-icon name="menu" />
          </button>
          <div class="crumb">
            <span class="crumb-root">{{ 'app.name' | t }}</span>
            <app-icon name="chevron-right" [size]="14" />
            <span class="crumb-current">{{ titleKey() | t }}</span>
          </div>

          <app-global-search class="topbar-search" data-tour="search" />

          <div class="topbar-actions">
            <div class="menu-wrap" data-tour="quick-add">
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

            <ng-container *ngTemplateOutlet="prefs" />

            <app-help-menu class="help-in-topbar" />

            <div class="menu-wrap account-wrap" data-tour="account">
              <button type="button" class="avatar-btn" (click)="accountOpen.set(!accountOpen())" aria-haspopup="menu"
                      [attr.aria-expanded]="accountOpen()" [attr.aria-label]="'auth.account' | t" [title]="auth.displayName()">
                <span class="avatar" aria-hidden="true">{{ initials() }}</span>
              </button>
              @if (accountOpen()) {
                <div class="menu account-menu" role="menu">
                  <div class="account-id">
                    <strong>{{ auth.displayName() }}</strong>
                    <span class="muted small">{{ auth.account()?.email }}</span>
                  </div>
                  @if (auth.isAdmin()) {
                    <button type="button" role="menuitem" (click)="go('/admin')"><app-icon name="shield" [size]="16" /> {{ 'nav.admin' | t }}</button>
                  }
                  <button type="button" role="menuitem" (click)="go('/settings')"><app-icon name="settings" [size]="16" /> {{ 'nav.settings' | t }}</button>
                  <button type="button" role="menuitem" (click)="signOut()"><app-icon name="log-out" [size]="16" /> {{ 'auth.signOut' | t }}</button>
                </div>
              }
            </div>
          </div>
        </header>
        }

        <ng-template #prefs>
          <div class="topbar-prefs" data-tour="prefs">
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
        </ng-template>

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
    @if (!authLayout()) { <app-help-menu [floating]="true" /> }
    <!-- The tour's overlay and welcome load on first use, so they don't add to the app's first download. -->
    @defer (when tour.run() || tour.picking()) { <app-tour-overlay /> }
    @defer (when tour.showWelcome()) { <app-tour-welcome [enabled]="!authLayout()" /> }
  `,
})
export class ShellComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sessions = inject(SessionDialogService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly tour = inject(TourService);

  protected readonly navOpen = signal(false);
  protected readonly quickOpen = signal(false);
  protected readonly accountOpen = signal(false);
  /** Account pages (sign-in, sign-up…) hide the sidebar and the app's top bar. */
  // Set from the URL before the first navigation finishes, so neither layout flashes on load.
  protected readonly authLayout = signal(/^\/(sign-in|sign-up|forgot-password|reset-password|verify-email|account-status|change-password)\b/.test(inject(Location).path()));
  protected readonly initials = computed(() => {
    const words = this.auth.displayName().split(/[\s@._-]+/).filter(Boolean);
    return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[1][0] : '')).toUpperCase() || '?';
  });
  protected readonly apiOffline = signal(false);
  protected readonly titleKey = signal('nav.dashboard');

  private readonly baseGroups: { key: string; items: NavItem[] }[] = [
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
  /** Administrators also see the admin area (the API checks the role on every admin request). */
  protected readonly groups = computed(() => this.auth.isAdmin()
    ? [...this.baseGroups, { key: 'nav.manage', items: [{ path: '/admin', key: 'nav.admin', icon: 'shield' }] }]
    : this.baseGroups);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      let r = this.route;
      while (r.firstChild) r = r.firstChild;
      this.titleKey.set((r.snapshot.data['titleKey'] as string) ?? 'app.name');
      this.authLayout.set(r.snapshot.data['layout'] === 'auth');
      // The help menu explains the page the route names; a page guide ends when the page changes.
      const helpId = r.snapshot.data['helpId'];
      if (this.tour.helpId() !== (isHelpId(helpId) ? helpId : null)) this.tour.endIfNotTour();
      this.tour.helpId.set(isHelpId(helpId) ? helpId : null);
      this.quickOpen.set(false);
      this.accountOpen.set(false);
    });

    void this.checkHealth();

    // The session ended while an app page was open (the cookie expired, or the password was
    // changed or reset on another device): go to sign-in, and come back afterwards.
    effect(() => {
      if (!this.auth.ready() || this.auth.account()) return;
      untracked(() => {
        if (this.authLayout() || !this.router.navigated) return;
        const url = this.router.url;
        void this.router.navigate(['/sign-in'], { queryParams: url !== '/' ? { returnUrl: url } : {} });
      });
    });

    // The account was suspended (or otherwise blocked) while an app page was open: show its status page.
    effect(() => {
      const account = this.auth.account();
      if (!account || this.auth.approved()) return;
      untracked(() => {
        if (this.authLayout() || !this.router.navigated) return;
        void this.router.navigateByUrl('/account-status');
      });
    });
  }

  protected go(path: string): void {
    this.accountOpen.set(false);
    void this.router.navigateByUrl(path);
  }

  protected async signOut(): Promise<void> {
    this.accountOpen.set(false);
    try {
      await this.auth.signOut();
      this.apiOffline.set(false);
      await this.router.navigateByUrl('/sign-in');
      this.toast.info(this.i18n.t('auth.signedOut'));
    } catch {
      this.toast.error(this.i18n.t('auth.errors.generic'));
    }
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
    const target = event.target as HTMLElement;
    if (!target.closest?.('.menu-wrap:not(.account-wrap):not(.help-wrap)')) this.quickOpen.set(false);
    if (!target.closest?.('.account-wrap')) this.accountOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.quickOpen.set(false);
    this.accountOpen.set(false);
    this.navOpen.set(false);
  }
}

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
import { SessionDialogComponent } from './session-dialog.component';
import { HelpMenuComponent } from './tour/help-menu.component';
import { TourOverlayComponent } from './tour/tour-overlay.component';
import { TourWelcomeComponent } from './tour/tour-welcome.component';

interface NavItem { path: string; key: string; icon: string; }

/** Up to this width the sidebar is a drawer (keep in step with the max-width: 960px rules in styles.css). */
const NARROW_MAX = 960;
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TranslatePipe, GlobalSearchComponent,
    ToastHostComponent, ConfirmDialogComponent, SessionDialogComponent, HelpMenuComponent, TourOverlayComponent, TourWelcomeComponent],
  template: `
    <a class="skip-link" href="#main">{{ 'common.skipToContent' | t }}</a>

    <div class="shell" [class.auth-layout]="authLayout()">
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
          <a class="brand-link" routerLink="/" (click)="closeNav()" [attr.aria-label]="'nav.dashboard' | t" [title]="'nav.dashboard' | t">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="30" height="30">
                <rect width="32" height="32" rx="9" fill="var(--bar-mark)" />
                <path d="M9 21.5 14 16l-5-5.5M16.5 22h7" fill="none" stroke="var(--bar-mark-ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <strong class="brand-name">{{ 'app.name' | t }}</strong>
          </a>
          <!-- Narrow screens: one button opens every group at once. -->
          <button type="button" class="icon-btn menu-btn" data-tour="menu" (click)="navOpen.set(!navOpen())" aria-controls="topnav"
                  [attr.aria-expanded]="navOpen()" [attr.aria-label]="'common.menu' | t" [title]="'common.menu' | t">
            <app-icon [name]="navOpen() ? 'x' : 'menu'" />
          </button>
          <nav class="nav topnav" id="topnav" data-tour="nav" [class.open]="navOpen()" [attr.aria-label]="'common.menu' | t">
            @for (group of groups(); track group.key) {
              @if (group.items.length === 1) {
                <a class="nav-trigger nav-link" [class.current]="group.key === activeGroup()" [routerLink]="group.items[0].path" (click)="closeNav()"
                   [attr.aria-current]="group.key === activeGroup() ? 'page' : null">{{ group.items[0].key | t }}</a>
              } @else {
                <div class="menu-wrap nav-menu" [class.current]="group.key === activeGroup()">
                  <button type="button" class="nav-trigger" (click)="toggleGroup(group.key)" aria-haspopup="true"
                          [attr.aria-expanded]="openGroup() === group.key">
                    {{ (group.key === activeGroup() ? activeLabel() : group.key) | t }} <app-icon name="chevron-down" [size]="14" />
                  </button>
                  <ul class="menu nav-panel" role="list" [class.show]="openGroup() === group.key">
                    @for (item of group.items; track item.path) {
                      <li>
                        <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                           (click)="closeNav()" #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">
                          <app-icon [name]="item.icon" [size]="18" />
                          <span>{{ item.key | t }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                </div>
              }
            }
          </nav>

          <app-global-search class="topbar-search" data-tour="search" />

          <div class="topbar-actions">
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
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly tour = inject(TourService);

  protected readonly navOpen = signal(false);
  private readonly narrowQuery = typeof matchMedia === 'function' ? matchMedia(`(max-width: ${NARROW_MAX}px)`) : null;
  protected readonly narrow = signal(this.narrowQuery?.matches ?? false);
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

  /** Pages that belong together share a menu, and a skin (see app.routes.ts and skins.css). */
  private readonly baseGroups: { key: string; items: NavItem[] }[] = [
    { key: 'nav.track', items: [
      { path: '/', key: 'nav.dashboard', icon: 'dashboard' },
      { path: '/progress', key: 'nav.progress', icon: 'chart' },
      { path: '/skills', key: 'nav.skills', icon: 'award' },
      { path: '/career', key: 'nav.career', icon: 'briefcase' },
      { path: '/cv', key: 'nav.cv', icon: 'file' },
    ] },
    { key: 'nav.learn', items: [
      { path: '/roadmap', key: 'nav.roadmap', icon: 'map' },
    ] },
    { key: 'nav.watch', items: [
      { path: '/videos', key: 'nav.videos', icon: 'video' },
      { path: '/resources', key: 'nav.resources', icon: 'link' },
    ] },
    { key: 'nav.build', items: [
      { path: '/projects', key: 'nav.projects', icon: 'folder' },
      { path: '/practice', key: 'nav.practice', icon: 'code' },
      { path: '/playground', key: 'nav.playground', icon: 'terminal' },
    ] },
    { key: 'nav.prepare', items: [
      { path: '/interviews', key: 'nav.interviews', icon: 'chat' },
      { path: '/notes', key: 'nav.notes', icon: 'note' },
    ] },
  ];
  protected readonly groups = computed(() => this.baseGroups);
  /** The menu that is open (wide screens open one at a time). */
  protected readonly openGroup = signal<string | null>(null);
  private readonly url = signal('/');
  /** The group of the page being shown, so its menu button is marked. Topic pages belong to the library. */
  protected readonly activeGroup = computed(() => {
    const path = this.url().split(/[?#]/)[0].replace(/^\/(topics|library)\b/, '/roadmap');
    return this.groups().find(g => g.items.some(i => i.path === '/' ? path === '/' : path === i.path || path.startsWith(i.path + '/')))?.key ?? null;
  });

  constructor() {
    const onWidth = (e: MediaQueryListEvent) => { this.narrow.set(e.matches); if (!e.matches) this.navOpen.set(false); };
    this.narrowQuery?.addEventListener('change', onWidth);
    inject(DestroyRef).onDestroy(() => this.narrowQuery?.removeEventListener('change', onWidth));

    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      let r = this.route;
      while (r.firstChild) r = r.firstChild;
      this.titleKey.set((r.snapshot.data['titleKey'] as string) ?? 'app.name');
      this.authLayout.set(r.snapshot.data['layout'] === 'auth');
      // Each page borrows the look of a familiar app; styles in skins.css key off <html data-skin>.
      const skin = r.snapshot.data['skin'] as string | undefined;
      if (skin) document.documentElement.dataset['skin'] = skin; else delete document.documentElement.dataset['skin'];
      // The help menu explains the page the route names; a page guide ends when the page changes.
      const helpId = r.snapshot.data['helpId'];
      if (this.tour.helpId() !== (isHelpId(helpId) ? helpId : null)) this.tour.endIfNotTour();
      this.tour.helpId.set(isHelpId(helpId) ? helpId : null);
      this.accountOpen.set(false);
      this.url.set(this.router.url);
      this.closeNav();
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

  /** While you are on a page, its group's button shows the page's name instead of the group's. */
  protected readonly activeLabel = computed(() => {
    const path = this.url().split(/[?#]/)[0].replace(/^\/(topics|library)\b/, '/roadmap');
    const group = this.groups().find(g => g.key === this.activeGroup());
    const items = [...(group?.items ?? [])].sort((a, b) => b.path.length - a.path.length);
    return items.find(i => i.path === '/' ? path === '/' : path === i.path || path.startsWith(i.path + '/'))?.key ?? group?.key ?? '';
  });

  protected toggleGroup(key: string): void { this.openGroup.update(open => (open === key ? null : key)); }

  protected closeNav(): void {
    this.openGroup.set(null);
    this.navOpen.set(false);
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

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest?.('.account-wrap')) this.accountOpen.set(false);
    if (!target.closest?.('.nav-menu')) this.openGroup.set(null);
    if (!target.closest?.('.topnav, .menu-btn')) this.navOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeNav();
    this.accountOpen.set(false);
    this.navOpen.set(false);
  }
}

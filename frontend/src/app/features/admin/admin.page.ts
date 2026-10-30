import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError } from '../../core/api-error';
import { AccountStatus, AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatDatePipe, FormatNumberPipe, TranslatePipe } from '../../core/i18n/pipes';
import { ConfirmService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent, ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';
import { AdminApiService, AdminAudit, AdminOverview, AdminUser, AdminUserList, StatusAction } from './admin-api.service';

type Tab = 'users' | 'admins' | 'activity';

/** An action that asks for an optional note (reject, suspend) opens this dialog instead of a plain confirmation. */
interface ReasonRequest { user: AdminUser; action: 'reject' | 'suspend'; }

const STATUSES: AccountStatus[] = ['PendingEmailVerification', 'PendingApproval', 'Approved', 'Rejected', 'Suspended'];
const PAGE_SIZE = 20;

/**
 * The admin area: account approval, administrators and the activity log.
 * Buttons only appear for actions that make sense; the API enforces every rule
 * (role, owner-only actions, protected main administrator) regardless of what is shown here.
 */
@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, TranslatePipe, FormatDatePipe, FormatNumberPipe, PageHeaderComponent, SkeletonComponent,
    ErrorStateComponent, EmptyStateComponent],
  template: `
    <app-page-header [title]="'admin.title' | t" [subtitle]="'admin.subtitle' | t">
      @if (overview(); as o) {
        <span class="chip" [class.chip-warn]="o.emailProvider === 'Log'" [title]="'admin.emailProviderHelp' | t">
          <app-icon name="mail" [size]="14" /> {{ 'admin.emailProvider' | t: { provider: o.emailProvider } }}
        </span>
      }
    </app-page-header>

    @if (overviewError()) {
      <section class="card"><app-error-state [error]="overviewError()" (retry)="loadOverview()" /></section>
    } @else if (!overview()) {
      <section class="card"><app-skeleton [rows]="3" [height]="40" /></section>
    } @else {
      @let s = overview()!.stats;
      <section class="card admin-stats" aria-labelledby="admin-stats-h" data-tour="admin-stats">
        <h2 id="admin-stats-h" class="sr-only">{{ 'admin.statsTitle' | t }}</h2>
        <dl class="stat-row admin-stat-row">
          <div><dt>{{ 'admin.stats.total' | t }}</dt><dd>{{ s.total | fmtNum }}</dd></div>
          <div class="stat-attention" [class.has-items]="s.pendingApproval > 0">
            <dt>{{ 'admin.stats.pendingApproval' | t }}</dt><dd>{{ s.pendingApproval | fmtNum }}</dd>
          </div>
          <div><dt>{{ 'admin.stats.pendingVerification' | t }}</dt><dd>{{ s.pendingVerification | fmtNum }}</dd></div>
          <div><dt>{{ 'admin.stats.approved' | t }}</dt><dd>{{ s.approved | fmtNum }}</dd></div>
          <div><dt>{{ 'admin.stats.rejected' | t }}</dt><dd>{{ s.rejected | fmtNum }}</dd></div>
          <div><dt>{{ 'admin.stats.suspended' | t }}</dt><dd>{{ s.suspended | fmtNum }}</dd></div>
          <div><dt>{{ 'admin.stats.admins' | t }}</dt><dd>{{ s.admins | fmtNum }}</dd></div>
          <div><dt>{{ 'admin.stats.recent' | t }}</dt><dd>{{ s.registeredLast7Days | fmtNum }}</dd></div>
        </dl>
        @if (s.pendingApproval > 0 && filterStatus() !== 'PendingApproval') {
          <button type="button" class="btn btn-secondary btn-sm" (click)="showPending()">
            <app-icon name="shield" [size]="15" /> {{ 'admin.reviewPending' | t: { count: s.pendingApproval } }}
          </button>
        }
      </section>
    }

    <div class="tabs admin-tabs" data-tour="admin-tabs" role="tablist" [attr.aria-label]="'admin.title' | t">
      @for (t of tabs; track t) {
        <button type="button" role="tab" [id]="'tab-' + t" [attr.aria-selected]="tab() === t" [attr.aria-controls]="'panel-' + t"
                [class.active]="tab() === t" (click)="selectTab(t)">{{ 'admin.tabs.' + t | t }}</button>
      }
    </div>

    @switch (tab()) {
      @case ('users') {
        <section class="card" id="panel-users" role="tabpanel" aria-labelledby="tab-users" data-tour="admin-users">
          <form class="toolbar" role="search" (ngSubmit)="search()">
            <div class="input-icon admin-search">
              <app-icon name="search" [size]="16" />
              <input class="input" type="search" name="q" [(ngModel)]="query" [attr.aria-label]="'admin.searchLabel' | t"
                     [placeholder]="'admin.searchPlaceholder' | t" maxlength="100" autocomplete="off" />
            </div>
            <label class="sr-only" for="admin-status">{{ 'admin.filterStatus' | t }}</label>
            <select id="admin-status" class="input admin-filter" name="status" [ngModel]="filterStatus()" (ngModelChange)="setStatus($event)">
              <option value="">{{ 'admin.allStatuses' | t }}</option>
              @for (st of statuses; track st) { <option [value]="st">{{ 'accountStatus.' + st | t }}</option> }
            </select>
            <button type="submit" class="btn btn-secondary">{{ 'nav.search' | t }}</button>
          </form>

          @if (usersError()) {
            <app-error-state [error]="usersError()" (retry)="loadUsers()" />
          } @else if (!users()) {
            <app-skeleton [rows]="6" />
          } @else if (users()!.items.length === 0) {
            <app-empty-state icon="user" [title]="'admin.noUsers' | t" [message]="'admin.noUsersHint' | t" />
          } @else {
            <div class="table-scroll">
              <table class="table admin-table">
                <caption class="sr-only">{{ 'admin.usersCaption' | t }}</caption>
                <thead>
                  <tr>
                    <th scope="col">{{ 'admin.col.user' | t }}</th>
                    <th scope="col">{{ 'admin.col.status' | t }}</th>
                    <th scope="col">{{ 'admin.col.registered' | t }}</th>
                    <th scope="col"><span class="sr-only">{{ 'admin.col.actions' | t }}</span></th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of users()!.items; track u.id) {
                    <tr [class.row-open]="openId() === u.id">
                      <th scope="row">
                        <div class="admin-user">
                          <span class="avatar avatar-sm" aria-hidden="true">{{ initials(u) }}</span>
                          <div>
                            <strong>{{ u.fullName }}</strong>
                            @if (u.isOwner) { <span class="chip chip-sm role-chip">{{ 'admin.owner' | t }}</span> }
                            @else if (u.isAdmin) { <span class="chip chip-sm role-chip">{{ 'admin.admin' | t }}</span> }
                            <span class="muted small admin-email" dir="ltr">{{ u.email }}</span>
                          </div>
                        </div>
                      </th>
                      <td><span class="badge account-badge" [attr.data-account]="u.status">{{ 'accountStatus.' + u.status | t }}</span></td>
                      <td class="nowrap">{{ u.createdAt | fmtDate }}</td>
                      <td>
                        <div class="row-actions">
                          @for (a of actionsFor(u); track a) {
                            <button type="button" class="btn btn-sm" [class.btn-primary]="a === 'approve' || a === 'reactivate'"
                                    [class.btn-secondary]="a === 'resend-verification'" [class.btn-ghost]="a === 'reject' || a === 'suspend'"
                                    [class.btn-danger-text]="a === 'reject' || a === 'suspend'" [disabled]="busyId() === u.id"
                                    (click)="run(u, a)">{{ 'admin.actions.' + a | t }}</button>
                          }
                          <button type="button" class="icon-btn" (click)="toggle(u.id)" [attr.aria-expanded]="openId() === u.id"
                                  [attr.aria-controls]="'details-' + u.id" [attr.aria-label]="'admin.details' | t: { name: u.fullName }">
                            <app-icon name="chevron-down" [size]="16" [class.rotated]="openId() === u.id" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    @if (openId() === u.id) {
                      <tr class="details-row" [id]="'details-' + u.id">
                        <td colspan="4">
                          <dl class="admin-details">
                            <div><dt>{{ 'admin.detail.emailVerified' | t }}</dt>
                              <dd>{{ u.emailVerifiedAt ? (u.emailVerifiedAt | fmtDate) : ((u.emailConfirmed ? 'admin.detail.confirmedBefore' : 'common.no') | t) }}</dd></div>
                            <div><dt>{{ 'admin.detail.approved' | t }}</dt>
                              <dd>{{ u.approvedAt ? (u.approvedAt | fmtDate) : '—' }}@if (u.approvedByEmail) { · <span dir="ltr">{{ u.approvedByEmail }}</span> }</dd></div>
                            <div><dt>{{ 'admin.detail.statusChanged' | t }}</dt>
                              <dd>{{ u.statusChangedAt ? (u.statusChangedAt | fmtDate) : '—' }}@if (u.statusChangedByEmail) { · <span dir="ltr">{{ u.statusChangedByEmail }}</span> }</dd></div>
                            <div><dt>{{ 'admin.detail.lastSignIn' | t }}</dt><dd>{{ u.lastSignInAt ? (u.lastSignInAt | fmtDate) : '—' }}</dd></div>
                            @if (u.statusReason) { <div class="wide"><dt>{{ 'admin.detail.reason' | t }}</dt><dd>{{ u.statusReason }}</dd></div> }
                          </dl>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
            <div class="pager">
              <span class="muted small">{{ 'admin.pageInfo' | t: { from: pageFrom(), to: pageTo(), total: users()!.total } }}</span>
              <div class="pager-controls">
                <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() <= 1" (click)="goPage(page() - 1)">
                  <app-icon name="chevron-left" [size]="16" class="flip-rtl" /> {{ 'common.previous' | t }}
                </button>
                <button type="button" class="btn btn-secondary btn-sm" [disabled]="pageTo() >= users()!.total" (click)="goPage(page() + 1)">
                  {{ 'common.next' | t }} <app-icon name="chevron-right" [size]="16" class="flip-rtl" />
                </button>
              </div>
            </div>
          }
        </section>
      }

      @case ('admins') {
        <section class="card stack" id="panel-admins" role="tabpanel" aria-labelledby="tab-admins">
          @if (overview()?.canManageAdmins) {
            <form class="toolbar" (ngSubmit)="promote()">
              <div class="field grow">
                <label for="promote-email">{{ 'admin.promoteLabel' | t }}</label>
                <input id="promote-email" class="input" type="email" name="promoteEmail" [(ngModel)]="promoteEmail" dir="ltr"
                       autocomplete="off" maxlength="254" [placeholder]="'admin.promotePlaceholder' | t" aria-describedby="promote-help" />
                <small id="promote-help" class="muted small">{{ 'admin.promoteHelp' | t }}</small>
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="promoting() || !promoteEmail.trim()">
                <app-icon name="plus" [size]="16" /> {{ 'admin.promote' | t }}
              </button>
            </form>
          } @else {
            <div class="callout callout-info"><app-icon name="info" /><p>{{ 'admin.ownerOnly' | t }}</p></div>
          }

          @if (overview(); as o) {
            <ul class="admin-list" role="list">
              @for (a of o.admins; track a.id) {
                <li>
                  <span class="avatar avatar-sm" aria-hidden="true">{{ initials(a) }}</span>
                  <div class="grow">
                    <strong>{{ a.fullName }}</strong>
                    <span class="chip chip-sm role-chip">{{ (a.isOwner ? 'admin.owner' : 'admin.admin') | t }}</span>
                    <span class="muted small admin-email" dir="ltr">{{ a.email }}</span>
                  </div>
                  @if (o.canManageAdmins && !a.isOwner) {
                    <button type="button" class="btn btn-ghost btn-sm btn-danger-text" (click)="revoke(a)" [disabled]="busyId() === a.id">
                      {{ 'admin.revoke' | t }}
                    </button>
                  }
                </li>
              }
            </ul>
            @if (o.canManageAdmins) {
              <div class="admin-test-email">
                <p class="small muted">{{ 'admin.testEmailHelp' | t }}</p>
                <button type="button" class="btn btn-secondary btn-sm" (click)="testEmail()" [disabled]="testing()">
                  <app-icon name="mail" [size]="15" /> {{ 'admin.testEmail' | t }}
                </button>
              </div>
            }
          }
        </section>
      }

      @case ('activity') {
        <section class="card" id="panel-activity" role="tabpanel" aria-labelledby="tab-activity">
          @if (auditError()) {
            <app-error-state [error]="auditError()" (retry)="loadAudit()" />
          } @else if (!audit()) {
            <app-skeleton [rows]="6" />
          } @else if (audit()!.length === 0) {
            <app-empty-state icon="clock" [title]="'admin.noActivity' | t" />
          } @else {
            <ol class="audit-list" role="list">
              @for (e of audit(); track e.id) {
                <li>
                  <span class="audit-when muted small">{{ e.createdAt | fmtDate }}</span>
                  <span>
                    <strong dir="ltr">{{ e.actorEmail === 'system' ? ('admin.system' | t) : e.actorEmail }}</strong>
                    {{ auditText(e) }}
                    @if (e.targetEmail) { <strong dir="ltr">{{ e.targetEmail }}</strong> }
                    @if (e.details) { <span class="muted"> — {{ e.details }}</span> }
                  </span>
                </li>
              }
            </ol>
          }
        </section>
      }
    }

    <dialog #reasonDialog class="dialog" (cancel)="$event.preventDefault(); closeReason()" aria-labelledby="reason-title">
      @if (reasonRequest(); as r) {
        <form (ngSubmit)="confirmReason()">
          <h2 id="reason-title">{{ 'admin.confirm.' + r.action + 'Title' | t }}</h2>
          <p>{{ 'admin.confirm.' + r.action | t: { name: r.user.fullName, email: r.user.email } }}</p>
          <div class="field">
            <label for="reason-text">{{ 'admin.reasonLabel' | t }}</label>
            <textarea id="reason-text" class="input" name="reason" rows="3" maxlength="500" [(ngModel)]="reason"
                      aria-describedby="reason-help"></textarea>
            <small id="reason-help" class="muted small">{{ 'admin.reasonHelp' | t }}</small>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="closeReason()">{{ 'common.cancel' | t }}</button>
            <button type="submit" class="btn btn-danger">{{ 'admin.actions.' + r.action | t }}</button>
          </div>
        </form>
      }
    </dialog>
  `,
})
export default class AdminPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly reasonDialog = viewChild<ElementRef<HTMLDialogElement>>('reasonDialog');

  protected readonly tabs: Tab[] = ['users', 'admins', 'activity'];
  protected readonly statuses = STATUSES;
  protected readonly tab = signal<Tab>('users');

  protected readonly overview = signal<AdminOverview | null>(null);
  protected readonly overviewError = signal<ApiError | null>(null);
  protected readonly users = signal<AdminUserList | null>(null);
  protected readonly usersError = signal<ApiError | null>(null);
  protected readonly audit = signal<AdminAudit[] | null>(null);
  protected readonly auditError = signal<ApiError | null>(null);

  protected query = '';
  protected readonly filterStatus = signal<AccountStatus | ''>('');
  protected readonly page = signal(1);
  protected readonly openId = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected promoteEmail = '';
  protected readonly promoting = signal(false);
  protected readonly testing = signal(false);

  protected readonly reasonRequest = signal<ReasonRequest | null>(null);
  protected reason = '';

  protected readonly pageFrom = computed(() => (this.users()?.total ? (this.page() - 1) * PAGE_SIZE + 1 : 0));
  protected readonly pageTo = computed(() => Math.min(this.page() * PAGE_SIZE, this.users()?.total ?? 0));

  constructor() {
    effect(() => {
      const dialog = this.reasonDialog()?.nativeElement;
      if (!dialog) return;
      if (this.reasonRequest() && !dialog.open) dialog.showModal();
      if (!this.reasonRequest() && dialog.open) dialog.close();
    });
  }

  ngOnInit(): void {
    void this.loadOverview();
    void this.loadUsers();
  }

  protected async loadOverview(): Promise<void> {
    this.overviewError.set(null);
    try {
      this.overview.set(await this.api.overview());
    } catch (e) {
      this.overviewError.set(ApiError.from(e));
    }
  }

  protected async loadUsers(): Promise<void> {
    this.usersError.set(null);
    try {
      this.users.set(await this.api.users({ q: this.query, status: this.filterStatus(), page: this.page(), pageSize: PAGE_SIZE }));
    } catch (e) {
      this.usersError.set(ApiError.from(e));
    }
  }

  protected async loadAudit(): Promise<void> {
    this.auditError.set(null);
    try {
      this.audit.set(await this.api.audit(100));
    } catch (e) {
      this.auditError.set(ApiError.from(e));
    }
  }

  protected selectTab(tab: Tab): void {
    this.tab.set(tab);
    if (tab === 'activity') void this.loadAudit();
  }

  protected search(): void {
    this.page.set(1);
    void this.loadUsers();
  }

  protected setStatus(status: AccountStatus | ''): void {
    this.filterStatus.set(status);
    this.search();
  }

  protected showPending(): void {
    this.tab.set('users');
    this.query = '';
    this.setStatus('PendingApproval');
  }

  protected goPage(page: number): void {
    this.page.set(Math.max(1, page));
    void this.loadUsers();
  }

  protected toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }

  /** Only the actions the API would accept for this account; everything is still checked on the server. */
  protected actionsFor(u: AdminUser): StatusAction[] {
    const me = this.auth.account();
    if (u.isOwner || u.id === me?.id) return [];
    if (u.isAdmin && !me?.isOwner) return [];
    switch (u.status) {
      case 'PendingEmailVerification': return ['resend-verification', 'reject'];
      case 'PendingApproval': return ['approve', 'reject'];
      case 'Approved': return ['suspend'];
      case 'Rejected':
      case 'Suspended': return ['reactivate'];
    }
  }

  protected async run(user: AdminUser, action: StatusAction): Promise<void> {
    if (action === 'reject' || action === 'suspend') {
      this.reason = '';
      this.reasonRequest.set({ user, action });
      return;
    }
    if (action !== 'resend-verification') {
      const ok = await this.confirm.ask({
        title: this.i18n.t(`admin.confirm.${action}Title`),
        message: this.i18n.t(`admin.confirm.${action}`, { name: user.fullName, email: user.email }),
        confirmText: this.i18n.t(`admin.actions.${action}`),
      });
      if (!ok) return;
    }
    await this.apply(user, action);
  }

  protected closeReason(): void {
    this.reasonRequest.set(null);
  }

  protected async confirmReason(): Promise<void> {
    const request = this.reasonRequest();
    if (!request) return;
    this.reasonRequest.set(null);
    await this.apply(request.user, request.action, this.reason);
  }

  private async apply(user: AdminUser, action: StatusAction, reason?: string): Promise<void> {
    this.busyId.set(user.id);
    try {
      const updated = await this.api.act(user.id, action, reason);
      this.users.update(list => list && { ...list, items: list.items.map(u => (u.id === updated.id ? updated : u)) });
      this.toast.success(this.i18n.t(`admin.done.${action}`, { email: user.email }));
      void this.loadOverview();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
      void this.loadUsers();
    } finally {
      this.busyId.set(null);
    }
  }

  protected async promote(): Promise<void> {
    const email = this.promoteEmail.trim();
    if (!email) return;
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.confirm.promoteTitle'),
      message: this.i18n.t('admin.confirm.promote', { email }),
      confirmText: this.i18n.t('admin.promote'),
    });
    if (!ok) return;
    this.promoting.set(true);
    try {
      await this.api.promote(email);
      this.promoteEmail = '';
      this.toast.success(this.i18n.t('admin.done.promote', { email }));
      await this.loadOverview();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.promoting.set(false);
    }
  }

  protected async revoke(admin: AdminUser): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.t('admin.confirm.revokeTitle'),
      message: this.i18n.t('admin.confirm.revoke', { email: admin.email }),
      confirmText: this.i18n.t('admin.revoke'),
      danger: true,
    });
    if (!ok) return;
    this.busyId.set(admin.id);
    try {
      await this.api.revoke(admin.id);
      this.toast.success(this.i18n.t('admin.done.revoke', { email: admin.email }));
      await this.loadOverview();
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busyId.set(null);
    }
  }

  protected async testEmail(): Promise<void> {
    this.testing.set(true);
    try {
      await this.api.testEmail();
      this.toast.success(this.i18n.t('admin.testEmailSent', { email: this.auth.account()?.email ?? '' }));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.testing.set(false);
    }
  }

  protected initials(u: AdminUser): string {
    const words = (u.fullName || u.email).split(/[\s@._-]+/).filter(Boolean);
    return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  protected auditText(e: AdminAudit): string {
    const key = `admin.audit.${e.action}`;
    return this.i18n.has(key) ? this.i18n.t(key) : e.action;
  }
}

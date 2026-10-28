import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { accountStatusGuard, adminGuard, authGuard, guestGuard } from './auth.guard';
import { Account, AccountStatus, AuthService } from './auth.service';
import { ar } from './i18n/ar';
import { en } from './i18n/en';

/** Stands in for AuthService: the guards only read the account and wait for restore(). */
function fakeAuth(account: Partial<Account> | null) {
  const value = signal<Account | null>(account && {
    id: '1', email: 'a@example.com', fullName: 'A', createdAt: '', status: 'Approved', emailVerified: true,
    isAdmin: false, isOwner: false, statusReason: null, ...account,
  });
  const approved = computed(() => value()?.status === 'Approved');
  return { account: value, approved, isAdmin: computed(() => approved() && !!value()?.isAdmin), restore: () => Promise.resolve() };
}

async function run(guard: typeof authGuard, account: Partial<Account> | null, url = '/roadmap'): Promise<string | true> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth(account) }] });
  const result = await TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)) as boolean | UrlTree;
  return result === true ? true : TestBed.inject(Router).serializeUrl(result as UrlTree);
}

describe('authGuard', () => {
  it('lets approved accounts in', async () => {
    expect(await run(authGuard, {})).toBe(true);
  });

  it('sends visitors to sign-in and brings them back afterwards', async () => {
    expect(await run(authGuard, null)).toBe('/sign-in?returnUrl=%2Froadmap');
  });

  it.each<AccountStatus>(['PendingEmailVerification', 'PendingApproval', 'Rejected', 'Suspended'])(
    'sends %s accounts to their status page', async (status) => {
      expect(await run(authGuard, { status })).toBe('/account-status');
    });
});

describe('accountStatusGuard', () => {
  it('shows the status page only to accounts that are not approved', async () => {
    expect(await run(accountStatusGuard, { status: 'PendingApproval' })).toBe(true);
    expect(await run(accountStatusGuard, {})).toBe('/');
    expect(await run(accountStatusGuard, null)).toBe('/sign-in');
  });
});

describe('adminGuard', () => {
  it('opens the admin area to approved administrators only', async () => {
    expect(await run(adminGuard, { isAdmin: true })).toBe(true);
    expect(await run(adminGuard, { isAdmin: false })).toBe('/');
    expect(await run(adminGuard, { isAdmin: true, status: 'Suspended' })).toBe('/');
  });
});

describe('guestGuard', () => {
  it('keeps signed-in accounts out of the sign-in pages', async () => {
    expect(await run(guestGuard, null)).toBe(true);
    expect(await run(guestGuard, {})).toBe('/');
    expect(await run(guestGuard, { status: 'PendingEmailVerification' })).toBe('/account-status');
  });
});

describe('translations', () => {
  const keys = (obj: object, prefix = ''): string[] => Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]);

  it('cover the account and admin screens in both languages', () => {
    for (const section of ['status', 'verify', 'admin', 'accountStatus'] as const) {
      expect(keys(ar[section as keyof typeof ar] as object).sort()).toEqual(keys(en[section as keyof typeof en] as object).sort());
    }
    expect(keys(ar.auth.errors).sort()).toEqual(keys(en.auth.errors).sort());
    expect(keys(ar.errors.codes).sort()).toEqual(keys(en.errors.codes).sort());
  });
});

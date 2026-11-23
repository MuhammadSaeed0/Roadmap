import { TestBed } from '@angular/core/testing';
import { I18nService } from '../../core/i18n/i18n.service';
import { AdminApiService, AdminUser } from './admin-api.service';
import { AdminUserPickerComponent, PICKER_LIMIT } from './admin-user-picker.component';

const user = (id: string, fullName: string, email: string, extra: Partial<AdminUser> = {}): AdminUser => ({
  id, email, fullName, status: 'Approved', emailConfirmed: true, isAdmin: false, isOwner: false,
  createdAt: '2026-11-01T00:00:00Z', emailVerifiedAt: null, approvedAt: null, approvedByEmail: null,
  statusChangedAt: null, statusChangedByEmail: null, statusReason: null, lastSignInAt: null, ...extra,
});

const people = [
  user('1', 'Sara Ali', 'sara@example.com'),
  user('2', 'Omar Hassan', 'omar@example.com'),
  user('3', 'Unconfirmed', 'new@example.com', { emailConfirmed: false }),
];

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('AdminUserPickerComponent', () => {
  function setup(found = people) {
    const queries: { q?: string; status?: string; role?: string; pageSize: number }[] = [];
    TestBed.configureTestingModule({
      providers: [{
        provide: AdminApiService,
        useValue: { users: (q: { q?: string; status?: string; role?: string; page: number; pageSize: number }) => {
          queries.push(q);
          return Promise.resolve({ items: found, total: found.length, page: 1, pageSize: q.pageSize });
        } },
      }],
    });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(AdminUserPickerComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await wait(260);
      fixture.detectChanges();
    };
    const key = (k: string) => {
      const e = new KeyboardEvent('keydown', { key: k, cancelable: true });
      input.dispatchEvent(e);
      fixture.detectChanges();
      return e;
    };
    return { fixture, el, input, type, key, queries };
  }

  it('lists matching accounts by name and email as the admin types a name', async () => {
    const { el, input, type, queries } = setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');

    await type('sa');
    expect(queries.at(-1)).toEqual(expect.objectContaining({ q: 'sa', status: 'Approved', role: 'user', pageSize: PICKER_LIMIT }));
    const options = [...el.querySelectorAll('[role="option"]')];
    // The unconfirmed account can't be promoted, so it isn't offered.
    expect(options.map(o => o.querySelector('.picker-name')?.textContent)).toEqual(['Sara Ali', 'Omar Hassan']);
    expect(options[0].textContent).toContain('sara@example.com');
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('fills in the email of the account that is clicked and closes the list', async () => {
    const { fixture, el, type } = setup();
    await type('omar');
    el.querySelectorAll<HTMLElement>('[role="option"]')[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('omar@example.com');
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('moves through the list with the arrow keys, picks with Enter and closes with Escape', async () => {
    const { fixture, el, input, type, key } = setup();
    await type('a');
    key('ArrowDown');
    key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe('promote-email-list-1');
    expect(el.querySelector('.picker-option.active')?.textContent).toContain('Omar Hassan');
    key('ArrowDown');   // wraps to the first
    expect(input.getAttribute('aria-activedescendant')).toBe('promote-email-list-0');
    const enter = key('Enter');
    expect(enter.defaultPrevented).toBe(true);   // the form isn't submitted
    expect(fixture.componentInstance.value()).toBe('sara@example.com');

    await type('o');
    expect(el.querySelector('[role="listbox"]')).not.toBeNull();
    key('Escape');
    expect(el.querySelector('[role="listbox"]')).toBeNull();
    // Without a highlighted match, Enter submits what was typed.
    expect(key('Enter').defaultPrevented).toBe(false);
  });

  it('says so when nothing matches', async () => {
    const { el, type } = setup([]);
    await type('zzz');
    expect(el.querySelectorAll('[role="option"]').length).toBe(0);
    expect(el.querySelector('.picker-empty')?.textContent).toContain('No approved account matches');
  });
});


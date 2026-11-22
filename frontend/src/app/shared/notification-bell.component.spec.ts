import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificationBellComponent } from './notification-bell.component';

describe('NotificationBellComponent', () => {
  it('asks for the unread count only once there is an account', async () => {
    const unreadCount = vi.fn(() => Promise.resolve({ count: 3 }));
    const account = signal<object | null>(null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ApiService, useValue: { unreadCount } }, { provide: AuthService, useValue: { account } }],
    });
    const fixture = TestBed.createComponent(NotificationBellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(unreadCount).not.toHaveBeenCalled();

    account.set({ id: 'u1', status: 'Approved' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(unreadCount).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('.bell-badge')?.textContent).toBe('3');
    fixture.destroy();
  });
});

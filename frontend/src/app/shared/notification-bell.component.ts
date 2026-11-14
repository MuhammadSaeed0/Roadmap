import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n/i18n.service';
import { FormatDatePipe, TranslatePipe } from '../core/i18n/pipes';
import { NotificationDto } from '../core/models';
import { IconComponent } from './icon.component';

const POLL_MS = 60_000;

@Component({
  selector: 'app-notification-bell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, FormatDatePipe],
  template: `
    <div class="menu-wrap">
      <button type="button" class="icon-btn bell-btn" (click)="toggle()" aria-haspopup="menu"
              [attr.aria-expanded]="open()" [attr.aria-label]="'notifications.title' | t" [title]="'notifications.title' | t">
        <app-icon name="bell" [size]="18" />
        @if (count() > 0) { <span class="bell-badge">{{ count() > 9 ? '9+' : count() }}</span> }
      </button>
      @if (open()) {
        <div class="menu bell-menu" role="menu">
          <p class="menu-label">{{ 'notifications.title' | t }}</p>
          @if (items().length === 0) {
            <p class="muted small bell-item">{{ 'notifications.noNotifications' | t }}</p>
          } @else {
            @for (n of items(); track n.id) {
              <a class="bell-item" [class.unread]="!n.isRead" role="menuitem"
                 [routerLink]="n.discussionId ? ['/discussions', n.discussionId] : n.projectId ? ['/projects', n.projectId] : null" (click)="open.set(false)">
                <span>{{ i18n.pick(n.messageEn, n.messageAr) }}</span>
                <small class="muted">{{ n.createdAt | fmtDate }}</small>
              </a>
            }
          }
        </div>
      }
    </div>
  `,
  styles: `
    .bell-btn { position: relative; }
    .bell-badge { position: absolute; top: 0; inset-inline-end: 0; min-width: 16px; padding: 0 4px; border-radius: 8px;
      background: var(--danger); color: #fff; font-size: 10px; line-height: 16px; }
    .bell-menu { width: 320px; max-height: 420px; overflow-y: auto; }
    .bell-item { display: grid; padding: 8px; border-radius: 8px; color: inherit; }
    .bell-item:hover { background: var(--surface-2); text-decoration: none; }
    .unread { font-weight: 600; }
  `,
})
export class NotificationBellComponent {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);

  protected readonly count = signal(0);
  protected readonly items = signal<NotificationDto[]>([]);
  protected readonly open = signal(false);

  constructor() {
    void this.refreshCount();
    const timer = setInterval(() => void this.refreshCount(), POLL_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  private async refreshCount(): Promise<void> {
    try { this.count.set((await this.api.unreadCount()).count); } catch { /* offline: keep the last count */ }
  }

  protected async toggle(): Promise<void> {
    const next = !this.open();
    this.open.set(next);
    if (!next) return;
    try {
      this.items.set((await this.api.notifications({ page: 1 })).items);
      const unread = this.items().filter(n => !n.isRead).map(n => n.id);
      if (unread.length) {
        await this.api.markNotificationsRead(unread);
        this.count.set(Math.max(0, this.count() - unread.length));
      }
    } catch { /* the list stays as it was */ }
  }
}

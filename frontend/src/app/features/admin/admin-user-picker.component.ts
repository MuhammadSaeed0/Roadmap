import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, input, model, signal } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/pipes';
import { AdminApiService, AdminUser } from './admin-api.service';

/** How many matching accounts the list shows at once. */
export const PICKER_LIMIT = 8;

/**
 * The email field of "Add an administrator", with a list of matching accounts under it (an ARIA combobox).
 * Typing a name or part of an email lists approved accounts with a confirmed email that are not administrators
 * yet, each with its name and email; picking one fills in the email. The field still accepts any typed email.
 */
@Component({
  selector: 'app-admin-user-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  styles: `
    :host { display: block; position: relative; }
    .picker-list {
      position: absolute; inset-inline: 0; top: calc(100% + 4px); z-index: 20; margin: 0; padding: 4px;
      list-style: none; max-height: 320px; overflow-y: auto;
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);
    }
    .picker-option { display: grid; gap: 2px; padding: 8px 10px; border-radius: 6px; cursor: pointer; }
    .picker-option.active, .picker-option:hover { background: var(--surface-2); }
    .picker-option.active { outline: 2px solid var(--focus); outline-offset: -2px; }
    .picker-name { font-weight: 500; overflow-wrap: anywhere; }
    .picker-email { overflow-wrap: anywhere; text-align: start; }
    .picker-empty { padding: 8px 10px; }
  `,
  template: `
    <input [id]="inputId()" class="input" type="text" name="promoteEmail" dir="auto" autocomplete="off" maxlength="254"
           role="combobox" aria-autocomplete="list" [attr.aria-expanded]="open()" [attr.aria-controls]="listId()"
           [attr.aria-activedescendant]="activeId()" [attr.aria-describedby]="describedBy() || null"
           [placeholder]="placeholder()" [value]="value()"
           (input)="onInput($any($event.target).value)" (focus)="search(value())" (blur)="close()" (keydown)="onKey($event)" />
    @if (open()) {
      <ul class="picker-list" role="listbox" [id]="listId()" [attr.aria-label]="'admin.picker.list' | t"
          (mousedown)="$event.preventDefault()">
        @for (u of matches(); track u.id; let i = $index) {
          <li class="picker-option" role="option" [id]="listId() + '-' + i" [class.active]="i === active()"
              [attr.aria-selected]="i === active()" (click)="choose(u)" (mousemove)="active.set(i)">
            <span class="picker-name">{{ u.fullName }}</span>
            <span class="picker-email muted small"><bdi dir="ltr">{{ u.email }}</bdi></span>
          </li>
        } @empty {
          <li class="picker-empty muted small" role="presentation">{{ 'admin.picker.none' | t }}</li>
        }
      </ul>
    }
  `,
})
export class AdminUserPickerComponent implements OnDestroy {
  private readonly api = inject(AdminApiService);

  readonly value = model('');
  readonly inputId = input('promote-email');
  readonly describedBy = input('');
  readonly placeholder = input('');

  protected readonly listId = computed(() => this.inputId() + '-list');
  protected readonly matches = signal<AdminUser[]>([]);
  /** Shown after the first answer for the current text, until the field loses focus or a match is picked. */
  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  protected readonly activeId = computed(() => (this.open() && this.active() >= 0 ? `${this.listId()}-${this.active()}` : null));

  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Answers to older searches that arrive late are ignored. */
  private request = 0;

  protected onInput(text: string): void {
    this.value.set(text);
    this.search(text);
  }

  /** Looks up matching accounts shortly after typing stops (the newest accounts when the field is empty). */
  search(text: string): void {
    clearTimeout(this.timer);
    const id = ++this.request;
    this.timer = setTimeout(async () => {
      let found: AdminUser[] = [];
      try {
        const list = await this.api.users({ q: text, status: 'Approved', role: 'user', page: 1, pageSize: PICKER_LIMIT });
        found = list.items.filter(u => u.emailConfirmed && !u.isAdmin);
      } catch {
        found = [];
      }
      if (id !== this.request) return;
      this.matches.set(found);
      this.active.set(-1);
      this.open.set(true);
    }, 200);
  }

  protected onKey(event: KeyboardEvent): void {
    const count = this.matches().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) { this.search(this.value()); return; }
        if (count === 0) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.active.update(i => (i < 0 ? (step > 0 ? 0 : count - 1) : (i + step + count) % count));
        return;
      }
      case 'Enter':
        // With a highlighted match, Enter picks it instead of submitting the form.
        if (this.open() && this.active() >= 0 && this.active() < count) {
          event.preventDefault();
          this.choose(this.matches()[this.active()]);
        }
        return;
      case 'Escape':
        if (this.open()) { event.preventDefault(); this.close(); }
        return;
    }
  }

  protected choose(user: AdminUser): void {
    this.value.set(user.email);
    this.close();
  }

  close(): void {
    clearTimeout(this.timer);
    this.request++;
    this.open.set(false);
    this.active.set(-1);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}

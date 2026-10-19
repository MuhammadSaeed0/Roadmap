import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark' | 'system';
const THEME_KEY = 'devpath.theme';

/** Light/dark theme stored in localStorage and applied as <html data-theme="...">. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly choice = signal<ThemeChoice>(readTheme());
  readonly resolved = computed<'light' | 'dark'>(() =>
    this.choice() === 'system' ? (this.systemDark() ? 'dark' : 'light') : (this.choice() as 'light' | 'dark'));

  constructor() {
    this.media?.addEventListener?.('change', e => this.systemDark.set(e.matches));
    effect(() => {
      this.document.documentElement.dataset['theme'] = this.resolved();
      try { localStorage.setItem(THEME_KEY, this.choice()); } catch { /* not remembered */ }
    });
  }

  set(choice: ThemeChoice): void { this.choice.set(choice); }
  toggle(): void { this.choice.set(this.resolved() === 'dark' ? 'light' : 'dark'); }
}

function readTheme(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  } catch {
    return 'system';
  }
}

export interface Toast { id: number; text: string; kind: 'success' | 'error' | 'info'; }

/** Notifications rendered by the shell. Messages are already translated by the caller. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(text: string): void { this.show(text, 'success'); }
  error(text: string): void { this.show(text, 'error', 6000); }
  info(text: string): void { this.show(text, 'info'); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(text: string, kind: Toast['kind'], ms = 3500): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list.slice(-3), { id, text, kind }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}

export interface ConfirmRequest { title: string; message: string; confirmText: string; danger: boolean; }

/** Promise-based confirmation dialog: `if (await confirm.ask({...})) { ... }` */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);
  private resolver: ((ok: boolean) => void) | null = null;

  ask(request: Partial<ConfirmRequest> & { message: string }): Promise<boolean> {
    this.resolver?.(false);
    this.current.set({ title: '', confirmText: '', danger: false, ...request });
    return new Promise(resolve => (this.resolver = resolve));
  }

  answer(ok: boolean): void {
    this.resolver?.(ok);
    this.resolver = null;
    this.current.set(null);
  }
}

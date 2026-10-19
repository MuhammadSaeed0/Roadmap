import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';
import { TranslatePipe } from '../../core/i18n/pipes';

/** Email sign-in with a one-time link (no passwords). Reached from the auth guard. */
@Component({
  selector: 'app-sign-in-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <section class="card sign-in" style="max-width: 28rem; margin: 3rem auto; padding: 1.5rem;">
      <h1 style="margin-top: 0;">{{ 'auth.title' | t }}</h1>
      <p>{{ 'auth.body' | t }}</p>

      <form (submit)="$event.preventDefault(); send()">
        <label style="display: block; margin-bottom: 0.5rem;">
          {{ 'auth.email' | t }}
          <input type="email" required autocomplete="email" class="input" style="width: 100%;"
                 [value]="email()" (input)="email.set($any($event.target).value)" />
        </label>
        <button type="submit" class="btn btn-primary" [disabled]="sending() || !email()">
          {{ 'auth.send' | t }}
        </button>
      </form>

      @if (sent()) { <p role="status">{{ 'auth.sent' | t }}</p> }
      @if (failed()) { <p role="alert" class="error">{{ 'auth.failed' | t }}</p> }
    </section>
  `,
})
export default class SignInPage {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    // Already signed in (for example, after following the link): go straight to the dashboard.
    if (this.supabase.user()) void this.router.navigateByUrl('/');
  }

  protected async send(): Promise<void> {
    this.sending.set(true);
    this.sent.set(false);
    this.failed.set(false);
    try {
      await this.supabase.sendMagicLink(this.email().trim());
      this.sent.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}

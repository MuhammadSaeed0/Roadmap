import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Owns the single Supabase client for the app. Everything that talks to the
 * database goes through ApiService, which uses this client. Only the anon key is
 * used here; row-level security in the database decides what each user can see.
 */
// Used until the placeholders in environment.ts are replaced. It never resolves, so the
// app starts, shows the "cannot reach the database" banner, and the console says why.
const NOT_CONFIGURED_URL = 'https://not-configured.invalid';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(this.projectUrl(), environment.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  /** The signed-in user, or null. Updated on every auth state change. */
  readonly user = signal<User | null>(null);
  /** True once the stored session has been read, so guards don't redirect too early. */
  readonly ready = signal(false);

  constructor() {
    this.client.auth.onAuthStateChange((_event, session: Session | null) => {
      this.user.set(session?.user ?? null);
      this.ready.set(true);
    });
  }

  private projectUrl(): string {
    if (/^https:\/\/.+/.test(environment.supabaseUrl)) return environment.supabaseUrl;
    console.warn('Supabase is not configured. Set supabaseUrl and supabaseAnonKey in src/environments/environment.ts.');
    return NOT_CONFIGURED_URL;
  }

  /** The signed-in user's id. Throws when nobody is signed in (guards prevent this in practice). */
  userId(): string {
    const id = this.user()?.id;
    if (!id) throw new Error('Not signed in.');
    return id;
  }

  /**
   * Makes sure someone is signed in. With no session, creates an anonymous one, so
   * the site works without a sign-in step. Needs "Anonymous sign-ins" enabled in Supabase.
   */
  async ensureSession(): Promise<void> {
    if (this.user()) return;
    const { error } = await this.client.auth.signInAnonymously();
    if (error) throw error;
  }

  /** Sends a one-time sign-in link to the email address. The link returns the user to this site. */
  async sendMagicLink(email: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { DayOfWeek, SKILLS, SkillArea } from '../../core/models';
import { SupabaseService } from '../../core/supabase.service';
import { ThemeChoice, ThemeService, ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe, PageHeaderComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <app-page-header [title]="'settings.title' | t" />
    <div class="grid grid-2">
      <section class="card stack" aria-labelledby="ap-h">
        <h2 id="ap-h" class="card-title"><app-icon name="sun" /> {{ 'settings.appearance' | t }}</h2>
        <fieldset class="fieldset">
          <legend>{{ 'common.language' | t }}</legend>
          <div class="segmented">
            <button type="button" [class.active]="i18n.lang() === 'en'" [attr.aria-pressed]="i18n.lang() === 'en'" (click)="i18n.setLang('en')" lang="en">English</button>
            <button type="button" [class.active]="i18n.lang() === 'ar'" [attr.aria-pressed]="i18n.lang() === 'ar'" (click)="i18n.setLang('ar')" lang="ar">العربية</button>
          </div>
          <p class="small muted">{{ 'settings.languageHelp' | t }}</p>
        </fieldset>
        <fieldset class="fieldset">
          <legend>{{ 'common.theme' | t }}</legend>
          <div class="segmented">
            @for (t of themes; track t) {
              <button type="button" [class.active]="theme.choice() === t" [attr.aria-pressed]="theme.choice() === t" (click)="theme.set(t)">{{ 'common.' + t | t }}</button>
            }
          </div>
          <p class="small muted">{{ 'settings.themeHelp' | t }}</p>
        </fieldset>
      </section>

      <section class="card" aria-labelledby="lp-h">
        <h2 id="lp-h" class="card-title"><app-icon name="target" /> {{ 'settings.learning' | t }}</h2>
        @if (loading()) {
          <app-skeleton [rows]="4" />
        } @else if (error()) {
          <app-error-state [error]="error()" (retry)="load()" />
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="stack" novalidate>
            <div class="field">
              <label for="goal">{{ 'settings.dailyGoal' | t }}</label>
              <input id="goal" type="number" class="input" min="10" max="600" step="5" formControlName="dailyGoalMinutes"
                     [attr.aria-invalid]="form.controls.dailyGoalMinutes.invalid" aria-describedby="goal-err" />
              @if (form.controls.dailyGoalMinutes.invalid) {
                <small id="goal-err" class="field-error">{{ 'validation.min' | t: { min: 10 } }} · {{ 'validation.max' | t: { max: 600 } }}</small>
              }
            </div>
            <div class="field">
              <label for="focus">{{ 'settings.focusSkill' | t }}</label>
              <select id="focus" class="input" formControlName="focusSkill">
                <option [ngValue]="null">{{ 'settings.focusNone' | t }}</option>
                @for (s of skills; track s) { <option [ngValue]="s">{{ 'skills.' + s | t }}</option> }
              </select>
              <small class="muted">{{ 'settings.focusHelp' | t }}</small>
            </div>
            <div class="field">
              <label for="week">{{ 'settings.weekStart' | t }}</label>
              <select id="week" class="input" formControlName="weekStartsOn">
                @for (d of days; track d) { <option [ngValue]="d">{{ 'days.' + d | t }}</option> }
              </select>
            </div>
            <label class="checkbox">
              <input type="checkbox" formControlName="allowSkippingPrerequisites" />
              <span>{{ 'settings.allowSkip' | t }}<br /><small class="muted">{{ 'settings.allowSkipHelp' | t }}</small></span>
            </label>
            <div><button type="submit" class="btn btn-primary" [disabled]="saving()">{{ (saving() ? 'common.saving' : 'common.save') | t }}</button></div>
          </form>
        }
      </section>

      <section class="card" aria-labelledby="ac-h">
        <h2 id="ac-h" class="card-title">{{ 'auth.signedInAs' | t: { email: supabase.user()?.email ?? '' } }}</h2>
        <button type="button" class="btn" (click)="signOut()">{{ 'auth.signOut' | t }}</button>
      </section>

      <section class="card" aria-labelledby="ab-h">
        <h2 id="ab-h" class="card-title"><app-icon name="database" /> {{ 'settings.about' | t }}</h2>
        <p>{{ 'settings.aboutText' | t }}</p>
      </section>
    </div>
  `,
})
export default class SettingsPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  protected readonly themes: ThemeChoice[] = ['light', 'dark', 'system'];
  protected readonly skills = SKILLS;
  protected readonly days: DayOfWeek[] = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<ApiError | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    dailyGoalMinutes: [60, [Validators.required, Validators.min(10), Validators.max(600)]],
    focusSkill: [null as SkillArea | null],
    weekStartsOn: ['Monday' as DayOfWeek],
    allowSkippingPrerequisites: [false],
  });

  protected readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  constructor() { void this.load(); }

  protected async signOut(): Promise<void> {
    try {
      await this.supabase.signOut();
      // Signing out starts a fresh anonymous session on the next page load.
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.form.reset(await this.api.preferences());
    } catch (e) {
      this.error.set(ApiError.from(e));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      this.form.reset(await this.api.savePreferences(this.form.getRawValue()));
      this.toast.success(this.i18n.t('settings.saved'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }
}

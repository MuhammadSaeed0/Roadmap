import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';

/** Opt in to a public profile at /u/{handle}. Off by default. */
@Component({
  selector: 'app-profile-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe],
  template: `
    <section class="card stack" aria-labelledby="pp-h">
      <h2 id="pp-h" class="card-title"><app-icon name="globe" /> {{ 'profile.settingsTitle' | t }}</h2>
      <p class="muted small">{{ 'profile.settingsIntro' | t }}</p>
      <div class="field">
        <label for="pp-handle">{{ 'profile.handleLabel' | t }}</label>
        <div class="row-gap">
          <span class="muted small" dir="ltr">{{ origin }}/u/</span>
          <input id="pp-handle" class="input grow" dir="ltr" maxlength="30" autocomplete="off" spellcheck="false"
                 [value]="handle()" (input)="handle.set($any($event.target).value.toLowerCase())" />
        </div>
        <span class="tiny muted">{{ 'profile.handleHint' | t }}</span>
      </div>
      <label class="check-label">
        <input type="checkbox" [checked]="isPublic()" (change)="isPublic.set($any($event.target).checked)" />
        <span>{{ 'profile.makePublic' | t }}</span>
      </label>
      <div class="row-gap">
        <button type="button" class="btn btn-primary" [disabled]="saving() || !changed()" (click)="save()">
          {{ (saving() ? 'common.saving' : 'common.save') | t }}
        </button>
        @if (saved()?.isPublic && saved()?.handle; as h) {
          <a class="btn btn-ghost" [routerLink]="['/u', saved()!.handle]"><app-icon name="external" [size]="15" /> {{ 'profile.view' | t }}</a>
        }
      </div>
    </section>
  `,
})
export class ProfileSettingsComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly origin = window.location.origin;
  protected readonly handle = signal('');
  protected readonly isPublic = signal(false);
  protected readonly saved = signal<{ isPublic: boolean; handle: string | null } | null>(null);
  protected readonly saving = signal(false);
  protected readonly changed = computed(() => {
    const s = this.saved();
    return !s || s.isPublic !== this.isPublic() || (s.handle ?? '') !== this.handle().trim();
  });

  constructor() { void this.load(); }

  private async load(): Promise<void> {
    try {
      const s = await this.api.profileSettings();
      this.saved.set(s);
      this.handle.set(s.handle ?? '');
      this.isPublic.set(s.isPublic);
    } catch { /* the section stays empty; saving will report a problem */ }
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    try {
      const s = await this.api.updateProfileSettings({ isPublic: this.isPublic(), handle: this.handle().trim() || null });
      this.saved.set(s);
      this.handle.set(s.handle ?? '');
      this.toast.success(this.i18n.t(s.isPublic ? 'profile.nowPublic' : 'profile.nowPrivate'));
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.saving.set(false);
    }
  }
}

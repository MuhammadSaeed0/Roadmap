import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { FormatNumberPipe, TranslatePipe } from '../../core/i18n/pipes';
import { ToastService } from '../../core/ui-services';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/ui.components';
import { APP_URL, HASHTAGS, MarketingShot, POST_AR, POST_EN, SHORT_AR, SHORT_EN, SHOTS, shotUrl } from './marketing.content';

type PostLang = 'ar' | 'en';

/**
 * Marketing Studio (administrators only): the Facebook post, the publishing kit and the screenshot gallery, built to be
 * used from a phone. Copy uses the Clipboard API, sharing uses the Web Share API (with the images where the browser can
 * share files), and nothing is ever posted automatically.
 */
@Component({
  selector: 'app-marketing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, PageHeaderComponent, TranslatePipe, FormatNumberPipe],
  templateUrl: './marketing.page.html',
  styleUrl: './marketing.page.css',
})
export default class MarketingPage {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly appUrl = APP_URL;
  protected readonly tagList = HASHTAGS;
  protected readonly hashtags = HASHTAGS.join(' ');
  protected readonly shots = SHOTS;
  protected readonly url = shotUrl;
  protected readonly facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(APP_URL);

  protected readonly postLang = signal<PostLang>(this.i18n.lang() === 'en' ? 'en' : 'ar');
  /** The text being edited; null means the original post of the chosen language. */
  private readonly edits = signal<Record<PostLang, string | null>>({ ar: null, en: null });
  protected readonly original = computed(() => (this.postLang() === 'ar' ? POST_AR : POST_EN));
  protected readonly text = computed(() => this.edits()[this.postLang()] ?? this.original());
  protected readonly edited = computed(() => this.text() !== this.original());
  protected readonly shortCaption = computed(() => (this.postLang() === 'ar' ? SHORT_AR : SHORT_EN));
  protected readonly justCopied = signal<string | null>(null);
  protected readonly canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  /** Index of the screenshot shown full size, or null. */
  protected readonly viewing = signal<number | null>(null);
  protected readonly current = computed<MarketingShot | null>(() => {
    const i = this.viewing();
    return i === null ? null : this.shots[i];
  });
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('viewer');
  protected readonly downloading = signal(false);

  protected edit(value: string): void {
    this.edits.update(e => ({ ...e, [this.postLang()]: value }));
  }

  protected reset(): void {
    this.edits.update(e => ({ ...e, [this.postLang()]: null }));
  }

  protected caption(shot: MarketingShot): string {
    return this.i18n.pick(shot.en, shot.ar);
  }

  /** Copies text and marks which button did it, so that button can say "Copied" for a moment. */
  protected async copy(value: string, id: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      this.justCopied.set(id);
      setTimeout(() => { if (this.justCopied() === id) this.justCopied.set(null); }, 2000);
      this.toast.success(this.i18n.t('marketing.copiedToast'));
      return true;
    } catch {
      this.toast.error(this.i18n.t('marketing.copyFailed'));
      return false;
    }
  }

  /** Phone flow: copy the post (Facebook drops shared text), then open the share sheet with the images when possible. */
  protected async share(): Promise<void> {
    await this.copy(this.text(), 'share');
    try {
      const files = await this.files();
      const data: ShareData = files && navigator.canShare?.({ files }) ? { files, text: this.text() } : { text: this.text(), url: APP_URL };
      if (!data.files) this.toast.info(this.i18n.t('marketing.shareUnsupported'));
      else this.toast.info(this.i18n.t('marketing.shareToast'));
      await navigator.share(data);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') this.toast.info(this.i18n.t('marketing.shareUnsupported'));
    }
  }

  protected open(index: number): void {
    this.viewing.set(index);
    const dialog = this.dialog()?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal?.();
  }

  protected close(): void {
    this.dialog()?.nativeElement.close?.();
    this.viewing.set(null);
  }

  protected step(delta: number): void {
    const i = this.viewing();
    if (i !== null) this.viewing.set((i + delta + this.shots.length) % this.shots.length);
  }

  /** Downloads every image one after another (browsers ask once before allowing several downloads). */
  protected async downloadAll(): Promise<void> {
    this.downloading.set(true);
    try {
      for (const shot of this.shots) {
        const link = document.createElement('a');
        link.href = this.url(shot.file);
        link.download = 'devpath-' + shot.file;
        document.body.appendChild(link);
        link.click();
        link.remove();
        await new Promise(r => setTimeout(r, 400));
      }
    } finally {
      this.downloading.set(false);
    }
  }

  private async files(): Promise<File[] | null> {
    try {
      return await Promise.all(this.shots.map(async s => {
        const blob = await (await fetch(this.url(s.file))).blob();
        return new File([blob], 'devpath-' + s.file, { type: 'image/jpeg' });
      }));
    } catch {
      return null;
    }
  }
}

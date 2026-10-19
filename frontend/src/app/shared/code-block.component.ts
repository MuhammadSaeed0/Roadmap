import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslatePipe } from '../core/i18n/pipes';
import { highlight } from './highlight';
import { IconComponent } from './icon.component';

const LABELS: Record<string, string> = {
  csharp: 'C#', typescript: 'TypeScript', sql: 'SQL', html: 'HTML', bash: 'Shell', http: 'HTTP', json: 'JSON', css: 'CSS', text: 'Text',
};

/** Code is always rendered left-to-right, even when the page is in Arabic (dir="rtl"). */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <figure class="code-block" dir="ltr">
      <figcaption class="code-head">
        <span class="code-lang">{{ label() }}</span>
        <button type="button" class="btn btn-ghost btn-xs" (click)="copy()">
          <app-icon [name]="copied() ? 'check' : 'copy'" [size]="14" />
          <span>{{ (copied() ? 'common.copied' : 'common.copy') | t }}</span>
        </button>
      </figcaption>
      <pre tabindex="0"><code [innerHTML]="html()"></code></pre>
    </figure>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly language = input<string | null>(null);
  protected readonly copied = signal(false);
  protected readonly html = computed(() => highlight(this.code(), this.language()));
  protected readonly label = computed(() => LABELS[this.language() ?? 'text'] ?? this.language() ?? '');

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // The clipboard can be unavailable (permissions/insecure context); copying is optional.
    }
  }
}

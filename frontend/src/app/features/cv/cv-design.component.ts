import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { IconComponent } from '../../shared/icon.component';
import { CvApiService, CvSectionKey, CvStyle } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';

const SWATCHES = ['#2563eb', '#0f766e', '#7c3aed', '#1e3a5f', '#b91c1c', '#c2410c', '#15803d', '#374151'];

/** Look of the CV: template, colour, font, spacing, direction, photo and the order of the sections. */
@Component({
  selector: 'app-cv-design',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, LocalizePipe],
  template: `
    @if (state.style(); as s) {
      <fieldset class="fieldset">
        <legend>{{ 'cv.design.template' | t }}</legend>
        <div class="cv-tpls">
          @for (tpl of state.templates(); track tpl.key) {
            <label class="cv-tpl" [class.selected]="state.templateKey() === tpl.key">
              <input type="radio" name="cv-template" [value]="tpl.key" [checked]="state.templateKey() === tpl.key" (change)="state.setTemplate(tpl.key)" />
              <img [src]="api.thumbnailUrl(tpl.key)" alt="" width="96" height="136" loading="lazy" />
              <span class="small">{{ tpl | loc: 'name' }}</span>
            </label>
          }
        </div>
        @if (state.template(); as tpl) { <p class="muted small">{{ tpl | loc: 'description' }}</p> }
      </fieldset>

      <fieldset class="fieldset">
        <legend>{{ 'cv.design.color' | t }}</legend>
        @if (state.template()?.supportsColor) {
          <div class="cv-swatches">
            @for (c of swatches; track c) {
              <button type="button" class="cv-swatch" [style.background]="c" [class.selected]="s.accent.toLowerCase() === c" [attr.aria-label]="c"
                      [attr.aria-pressed]="s.accent.toLowerCase() === c" (click)="state.setStyle({ accent: c })"></button>
            }
            <label class="cv-custom-color">
              <input type="color" [value]="s.accent" (change)="state.setStyle({ accent: val($event) })" [attr.aria-label]="'cv.design.color' | t" />
              <span class="small mono" dir="ltr">{{ s.accent }}</span>
            </label>
          </div>
        } @else {
          <p class="muted small">{{ 'cv.design.colorFixed' | t }}</p>
        }
      </fieldset>

      <div class="cv-grid">
        <div class="field">
          <label for="cv-font">{{ 'cv.design.font' | t }}</label>
          <select id="cv-font" class="input" (change)="state.setStyle({ font: $any(val($event)) })">
            @for (f of fonts; track f) { <option [value]="f" [selected]="s.font === f">{{ 'cv.design.fonts.' + f | t }}</option> }
          </select>
        </div>
        <div class="field">
          <label for="cv-density">{{ 'cv.design.density' | t }}</label>
          <select id="cv-density" class="input" (change)="state.setStyle({ density: $any(val($event)) })">
            <option value="comfortable" [selected]="s.density === 'comfortable'">{{ 'cv.design.comfortable' | t }}</option>
            <option value="compact" [selected]="s.density === 'compact'">{{ 'cv.design.compact' | t }}</option>
          </select>
        </div>
        <div class="field">
          <label for="cv-dir">{{ 'cv.design.direction' | t }}</label>
          <select id="cv-dir" class="input" (change)="state.setStyle({ direction: $any(val($event)) })">
            <option value="ltr" [selected]="s.direction === 'ltr'">{{ 'cv.design.ltr' | t }}</option>
            <option value="rtl" [selected]="s.direction === 'rtl'">{{ 'cv.design.rtl' | t }}</option>
          </select>
        </div>
      </div>
      @if (state.template()?.supportsPhoto) {
        <label class="check-label"><input type="checkbox" [checked]="s.showPhoto" (change)="state.setStyle({ showPhoto: checked($event) })" /> {{ 'cv.design.showPhoto' | t }}</label>
      }

      <fieldset class="fieldset">
        <legend>{{ 'cv.design.sections' | t }}</legend>
        <p class="muted small">{{ 'cv.design.sectionsHint' | t }}</p>
        <ol class="cv-order">
          @for (key of s.sectionOrder; track key; let i = $index) {
            <li [class.hidden-section]="s.hidden.includes(key)">
              <span class="grow">{{ 'cv.sectionNames.' + key | t }}</span>
              <button type="button" class="icon-btn" (click)="state.toggleSection(key)" [attr.aria-pressed]="!s.hidden.includes(key)"
                      [attr.aria-label]="(s.hidden.includes(key) ? 'cv.design.show' : 'cv.design.hide') | t: { name: ('cv.sectionNames.' + key | t) }">
                <app-icon [name]="s.hidden.includes(key) ? 'eye-off' : 'eye'" [size]="15" /></button>
              <button type="button" class="icon-btn" (click)="state.moveSection(key, -1)" [disabled]="i === 0" [attr.aria-label]="('cv.actions.moveUp' | t) + ': ' + ('cv.sectionNames.' + key | t)">
                <app-icon name="chevron-up" [size]="15" /></button>
              <button type="button" class="icon-btn" (click)="state.moveSection(key, 1)" [disabled]="i === s.sectionOrder.length - 1" [attr.aria-label]="('cv.actions.moveDown' | t) + ': ' + ('cv.sectionNames.' + key | t)">
                <app-icon name="chevron-down" [size]="15" /></button>
            </li>
          }
        </ol>
        <button type="button" class="btn btn-sm btn-ghost" (click)="resetOrder(s)"><app-icon name="refresh" [size]="14" /> {{ 'cv.design.resetOrder' | t }}</button>
      </fieldset>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; }
    .cv-tpls { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
    .cv-tpl { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 5px; border: 2px solid transparent; border-radius: var(--radius-xs); cursor: pointer; text-align: center; }
    .cv-tpl.selected { border-color: var(--accent); background: var(--accent-soft); }
    .cv-tpl input { position: absolute; opacity: 0; pointer-events: none; }
    .cv-tpl:has(input:focus-visible) { box-shadow: var(--focus); }
    .cv-tpl img { width: 100%; height: auto; border: 1px solid var(--border); border-radius: 4px; background: #fff; }
    .cv-swatches { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .cv-swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--surface); box-shadow: 0 0 0 1px var(--border-strong); cursor: pointer; }
    .cv-swatch.selected { box-shadow: 0 0 0 3px var(--accent); }
    .cv-custom-color { display: inline-flex; align-items: center; gap: 6px; }
    .cv-custom-color input { width: 36px; height: 30px; padding: 0; border: 1px solid var(--border); border-radius: 6px; background: none; cursor: pointer; }
    .cv-grid { display: grid; gap: 10px 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
    .cv-order { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
    .cv-order li { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--radius-xs); background: var(--surface); }
    .cv-order li.hidden-section span { color: var(--muted); text-decoration: line-through; }
  `,
})
export class CvDesignComponent {
  protected readonly state = inject(CvEditorState);
  protected readonly api = inject(CvApiService);
  protected readonly swatches = SWATCHES;
  protected readonly fonts: CvStyle['font'][] = ['sans', 'serif', 'lato'];

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }
  protected checked(e: Event): boolean { return (e.target as HTMLInputElement).checked; }

  protected resetOrder(s: CvStyle): void {
    const order = this.state.template()?.defaultOrder ?? s.sectionOrder;
    this.state.setStyle({ sectionOrder: [...order] as CvSectionKey[] });
  }
}

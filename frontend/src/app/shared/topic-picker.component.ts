import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { I18nService } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/pipes';
import { Phase, TopicSummary } from '../core/models';
import { IconComponent } from './icon.component';

interface Group { phase: Phase; topics: TopicSummary[]; }

/** Lowercases and drops accents, Arabic diacritics and tatweel, so "تَعلّم" matches "تعلم". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ًͯ-ٰٟـ]/g, '').toLowerCase().trim();
}

/** Picks one topic from the roadmap by typing part of its English or Arabic title. */
@Component({
  selector: 'app-topic-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <div class="picker" (focusout)="onFocusOut($event)">
      <app-icon name="search" [size]="15" class="picker-icon" />
      <input type="text" class="input" role="combobox" autocomplete="off" aria-autocomplete="list"
             [id]="inputId()" [attr.aria-controls]="inputId() + '-list'" [attr.aria-expanded]="open()"
             [attr.aria-activedescendant]="activeId()" [attr.aria-label]="label()"
             [placeholder]="placeholder()" [value]="open() ? query() : selectedTitle()"
             (focus)="openList()" (click)="openList()" (input)="onInput($any($event.target).value)" (keydown)="onKeydown($event)" />
      @if (value() !== null && !open()) {
        <button type="button" class="icon-btn picker-clear" [attr.aria-label]="'common.clear' | t" (click)="choose(null)">
          <app-icon name="x" [size]="14" />
        </button>
      }
      @if (open()) {
        <div class="picker-panel" role="listbox" [id]="inputId() + '-list'" [attr.aria-label]="label()">
          @if (allowAll() && !query()) {
            <button type="button" role="option" class="picker-option picker-all" [id]="optionId(null)"
                    [class.active]="active() === null" [attr.aria-selected]="value() === null"
                    (mousedown)="$event.preventDefault()" (click)="choose(null)">{{ allLabel() }}</button>
          }
          @for (g of groups(); track g.phase.id) {
            <div role="group" [attr.aria-label]="i18n.pick(g.phase.titleEn, g.phase.titleAr)">
              <p class="picker-group">{{ i18n.pick(g.phase.titleEn, g.phase.titleAr) }}</p>
              @for (t of g.topics; track t.id) {
                <button type="button" role="option" class="picker-option" [id]="optionId(t.id)"
                        [class.active]="active() === t.id" [attr.aria-selected]="value() === t.id"
                        (mousedown)="$event.preventDefault()" (click)="choose(t.id)">
                  {{ i18n.pick(t.titleEn, t.titleAr) }}
                  @if (value() === t.id) { <app-icon name="check" [size]="14" /> }
                </button>
              }
            </div>
          } @empty {
            <p class="picker-empty">{{ 'common.noResults' | t }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .picker { position: relative; }
    .picker .input { width: 100%; padding-inline-start: 34px; padding-inline-end: 34px; }
    .picker-icon { position: absolute; inset-inline-start: 11px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
    .picker-clear { position: absolute; inset-inline-end: 4px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; }
    .picker-panel {
      position: absolute; inset-inline: 0; top: calc(100% + 6px); z-index: 40; max-height: 340px; overflow-y: auto; padding: 6px;
      background: var(--surface); color: var(--text); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);
    }
    .picker-group { margin: 8px 8px 4px; font-size: 0.74rem; font-weight: 600; color: var(--muted); }
    .picker-option {
      display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 7px 10px;
      border: 0; border-radius: var(--radius-xs); background: none; color: var(--text); text-align: start; cursor: pointer; font-size: 0.9rem;
    }
    .picker-option:hover, .picker-option.active { background: var(--surface-2); }
    .picker-option[aria-selected='true'] { color: var(--accent-text); font-weight: 600; }
    .picker-all { font-weight: 600; }
    .picker-empty { margin: 8px; color: var(--muted); font-size: 0.9rem; }
  `,
})
export class TopicPickerComponent {
  protected readonly i18n = inject(I18nService);

  readonly phases = input.required<Phase[]>();
  readonly value = input<number | null>(null);
  readonly allowAll = input(false);
  readonly allLabel = input('');
  readonly placeholder = input('');
  readonly label = input('');
  readonly inputId = input('topic-picker');
  readonly valueChange = output<number | null>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  /** The highlighted option: a topic id, null for "all", undefined for none. */
  protected readonly active = signal<number | null | undefined>(undefined);

  protected readonly groups = computed<Group[]>(() => {
    const q = normalize(this.query());
    return this.phases()
      .map(phase => ({
        phase,
        topics: q ? phase.topics.filter(t => normalize(t.titleEn).includes(q) || normalize(t.titleAr).includes(q)) : phase.topics,
      }))
      .filter(g => g.topics.length > 0);
  });

  /** Options in keyboard order. */
  private readonly options = computed<(number | null)[]>(() => [
    ...(this.allowAll() && !this.query() ? [null] : []),
    ...this.groups().flatMap(g => g.topics.map(t => t.id)),
  ]);

  protected readonly selectedTitle = computed(() => {
    const id = this.value();
    if (id === null) return this.allowAll() ? this.allLabel() : '';
    const topic = this.phases().flatMap(p => p.topics).find(t => t.id === id);
    return topic ? this.i18n.pick(topic.titleEn, topic.titleAr) : '';
  });

  protected readonly activeId = computed(() => {
    const a = this.active();
    return this.open() && a !== undefined ? this.optionId(a) : null;
  });

  protected optionId(id: number | null): string {
    return `${this.inputId()}-opt-${id ?? 'all'}`;
  }

  protected openList(): void {
    if (this.open()) return;
    this.query.set('');
    this.active.set(this.value() ?? (this.allowAll() ? null : undefined));
    this.open.set(true);
  }

  protected onInput(text: string): void {
    this.query.set(text);
    this.open.set(true);
    this.active.set(this.options()[0]);
  }

  protected onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.open()) { this.openList(); return; }
      const list = this.options();
      if (!list.length) return;
      const i = list.indexOf(this.active() as number | null);
      const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i <= 0 ? list.length - 1 : i - 1);
      this.active.set(list[next]);
      document.getElementById(this.optionId(list[next]))?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && this.open()) {
      e.preventDefault();
      const a = this.active();
      if (a !== undefined) this.choose(a);
    } else if (e.key === 'Escape' && this.open()) {
      e.preventDefault();
      this.close();
    }
  }

  protected onFocusOut(e: FocusEvent): void {
    const next = e.relatedTarget as Node | null;
    if (!next || !(e.currentTarget as HTMLElement).contains(next)) this.close();
  }

  protected choose(id: number | null): void {
    this.close();
    if (id !== this.value()) this.valueChange.emit(id);
  }

  private close(): void {
    this.open.set(false);
    this.query.set('');
    this.active.set(undefined);
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { Lesson } from '../../core/models';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';

interface Span { text: string; code: boolean; }
interface Block { kind: 'p' | 'ul'; lines: Span[][]; }

/** Splits "text with `code`" into plain and code spans, so the template needs no innerHTML. */
export function inlineSpans(text: string): Span[] {
  return text.split('`').map((part, i) => ({ text: part, code: i % 2 === 1 })).filter(s => s.text.length > 0);
}

/** A lesson body: paragraphs separated by a blank line; consecutive lines starting with "- " form a list. */
export function lessonBlocks(body: string): Block[] {
  return body.split(/\n\s*\n/).map(chunk => chunk.trim()).filter(Boolean).map(chunk => {
    const lines = chunk.split('\n');
    return lines.every(l => l.startsWith('- '))
      ? { kind: 'ul' as const, lines: lines.map(l => inlineSpans(l.slice(2))) }
      : { kind: 'p' as const, lines: [inlineSpans(lines.join(' '))] };
  });
}

/**
 * The written tutorial of a topic: short lessons in reading order, each with an explanation, an example
 * and the output it prints. One lesson is shown at a time, with a list to jump between them.
 */
@Component({
  selector: 'app-topic-tutorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TranslatePipe, LocalizePipe, CodeBlockComponent],
  styles: `
    .tutorial-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; align-items: start; }
    .lesson-nav { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
    .lesson-nav button {
      display: flex; gap: 8px; align-items: baseline; width: 100%; padding: 8px 12px; border: 0; border-radius: var(--radius-sm);
      background: none; color: var(--text-2); text-align: start; cursor: pointer; font-size: 0.9rem;
    }
    .lesson-nav button:hover { background: var(--surface-2); }
    .lesson-nav button.active { background: var(--accent-soft); color: var(--accent-text); font-weight: 600; }
    .lesson-num { font-variant-numeric: tabular-nums; color: var(--muted); }
    .lesson h3 { font-size: 1.2rem; margin-bottom: 12px; }
    .lesson p, .lesson li { line-height: 1.7; }
    .lesson ul { margin: 0 0 12px; padding-inline-start: 20px; }
    .lesson code.inline { padding: 1px 6px; border-radius: 6px; background: var(--surface-2); font-size: 0.88em; direction: ltr; unicode-bidi: isolate; }
    .lesson-label { margin: 16px 0 6px; font-size: 0.82rem; font-weight: 600; color: var(--muted); }
    .lesson-output { margin: 0; padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface-2);
      font-family: var(--font-mono); font-size: 0.86rem; white-space: pre-wrap; direction: ltr; text-align: left; }
    .lesson-foot { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
    @media (max-width: 860px) {
      .tutorial-layout { grid-template-columns: 1fr; gap: 12px; }
      .lesson-nav { flex-direction: row; overflow-x: auto; }
      .lesson-nav button { width: auto; white-space: nowrap; }
    }
  `,
  template: `
    @if (lessons().length > 0) {
      <section class="card content-section tutorial" id="tutorial" aria-labelledby="tutorial-h" data-tour="topic-tutorial">
        <h2 id="tutorial-h" class="section-title"><app-icon name="book" /> {{ 'tutorial.title' | t }}</h2>
        <div class="tutorial-layout">
          <ol class="lesson-nav" [attr.aria-label]="'tutorial.lessons' | t">
            @for (l of lessons(); track l.id; let i = $index) {
              <li>
                <button type="button" [class.active]="i === index()" [attr.aria-current]="i === index() ? 'step' : null" (click)="go(i)">
                  <span class="lesson-num">{{ i + 1 }}</span><span>{{ l | loc: 'title' }}</span>
                </button>
              </li>
            }
          </ol>

          @if (current(); as l) {
            <article class="lesson" aria-live="polite">
              <h3>{{ l | loc: 'title' }}</h3>
              @for (b of blocks(); track $index) {
                @if (b.kind === 'p') {
                  <p>@for (s of b.lines[0]; track $index) {@if (s.code) {<code class="inline">{{ s.text }}</code>} @else {{{ s.text }}}}</p>
                } @else {
                  <ul>
                    @for (line of b.lines; track $index) {
                      <li>@for (s of line; track $index) {@if (s.code) {<code class="inline">{{ s.text }}</code>} @else {{{ s.text }}}}</li>
                    }
                  </ul>
                }
              }
              @if (l.code) {
                <p class="lesson-label">{{ 'tutorial.example' | t }}</p>
                <app-code-block [code]="l.code" [language]="l.codeLanguage" />
              }
              @if (l.output) {
                <p class="lesson-label">{{ 'tutorial.output' | t }}</p>
                <pre class="lesson-output">{{ l.output }}</pre>
              }
              <div class="lesson-foot">
                <button type="button" class="btn btn-ghost btn-sm" [disabled]="index() === 0" (click)="go(index() - 1)">
                  <app-icon name="chevron-left" [size]="14" class="flip-rtl" /> {{ 'common.previous' | t }}
                </button>
                @if (l.code && l.codeLanguage === 'csharp') {
                  <a class="btn btn-secondary btn-sm" routerLink="/playground"><app-icon name="terminal" [size]="14" /> {{ 'tutorial.tryIt' | t }}</a>
                }
                <button type="button" class="btn btn-primary btn-sm" [disabled]="index() >= lessons().length - 1" (click)="go(index() + 1)">
                  {{ 'common.next' | t }} <app-icon name="chevron-right" [size]="14" class="flip-rtl" />
                </button>
              </div>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class TopicTutorialComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  readonly topicId = input.required<number>();
  private readonly data = createLoader(() => this.api.lessons(this.topicId()), { immediate: false });
  protected readonly lessons = computed<Lesson[]>(() => this.data.value() ?? []);
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.lessons()[this.index()] ?? null);
  protected readonly blocks = computed(() => {
    const l = this.current();
    return l ? lessonBlocks(this.i18n.pick(l.bodyEn, l.bodyAr)) : [];
  });

  constructor() {
    effect(() => {
      this.topicId();
      untracked(() => { this.index.set(0); void this.data.reload(); });
    });
  }

  protected go(i: number): void {
    this.index.set(Math.max(0, Math.min(i, this.lessons().length - 1)));
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LocalizePipe, TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { GlossaryTerm, Lesson } from '../../core/models';
import { GlossaryService, TermSpan, markTerms, termMatcher } from '../../core/glossary';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';

interface Span { text: string; code: boolean; }
interface Block { kind: 'p' | 'ul'; lines: Span[][]; }

/** Splits "text with `code`" into plain and code spans, so the template needs no innerHTML. */
export function inlineSpans(text: string): Span[] {
  return text.split('`').map((part, i) => ({ text: part, code: i % 2 === 1 })).filter(s => s.text.length > 0);
}

/**
 * A lesson body: paragraphs separated by a blank line; consecutive lines starting with "- " form a list,
 * also when they follow a paragraph line directly ("Decide:\n- one\n- two").
 */
export function lessonBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean)) {
    let text: string[] = [];
    let items: string[] = [];
    const flushText = () => { if (text.length) blocks.push({ kind: 'p', lines: [inlineSpans(text.join(' '))] }); text = []; };
    const flushItems = () => { if (items.length) blocks.push({ kind: 'ul', lines: items.map(inlineSpans) }); items = []; };
    for (const line of chunk.split('\n').map(l => l.trim())) {
      if (line.startsWith('- ')) { flushText(); items.push(line.slice(2)); }
      else { flushItems(); text.push(line); }
    }
    flushText();
    flushItems();
  }
  return blocks;
}

/**
 * The written tutorial of a topic: short lessons in reading order, each with an explanation, an example
 * and the output it prints. One lesson is shown at a time, with a list to jump between them.
 */
@Component({
  selector: 'app-topic-tutorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet, IconComponent, TranslatePipe, LocalizePipe, CodeBlockComponent],
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
    .gl-ref {
      display: inline; padding: 0; margin: 0; border: 0; background: none; font: inherit; color: inherit; cursor: help;
      text-decoration: underline dotted var(--accent); text-underline-offset: 3px; text-decoration-thickness: 1.5px;
    }
    .gl-ref:hover, .gl-ref[aria-expanded='true'] { color: var(--accent-text); }
    .gl-ref:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 3px; }
    .gl-card {
      margin: -4px 0 12px; padding: 12px 14px; border: 1px solid var(--border); border-inline-start: 3px solid var(--accent);
      border-radius: var(--radius-sm); background: var(--surface-2); font-size: 0.92rem;
    }
    .gl-card-head { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
    .gl-card p { margin: 6px 0 8px; }
    .gl-card-links { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; }
    .gl-card-close { margin-inline-start: auto; }
    .lesson-foot { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
    @media (max-width: 860px) {
      .tutorial-layout { grid-template-columns: minmax(0, 1fr); gap: 12px; }
      .lesson-nav { flex-direction: row; overflow-x: auto; }
      .lesson-nav button { width: auto; white-space: nowrap; }
    }
    @media (max-width: 640px) {
      .lesson-output { padding: 10px 12px; font-size: 0.82rem; }
      .lesson h3 { font-size: 1.05rem; }
      .lesson-nav button { padding: 6px 10px; font-size: 0.84rem; }
      .lesson-foot { gap: 8px; margin-top: 14px; padding-top: 12px; }
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

          <ng-template #span let-s let-block="block">@if (s.code) {<code class="inline">{{ s.text }}</code>} @else if (s.term) {<button type="button" class="gl-ref" [id]="refId(block, s.term)" [attr.aria-expanded]="isOpen(block, s.term)" [attr.aria-controls]="'gl-card-' + block" [attr.aria-label]="('glossary.explain' | t: { term: s.text })" (click)="toggle(block, s.term)" (keydown.escape)="close(true)">{{ s.text }}</button>} @else {{{ s.text }}}</ng-template>
          @if (current(); as l) {
            <article class="lesson" aria-live="polite">
              <h3>{{ l | loc: 'title' }}</h3>
              @for (b of blocks(); track $index) {
                @let bi = $index;
                @if (b.kind === 'p') {
                  <p>@for (s of b.lines[0]; track $index) {<ng-container *ngTemplateOutlet="span; context: { $implicit: s, block: bi }" />}</p>
                } @else {
                  <ul>
                    @for (line of b.lines; track $index) {
                      <li>@for (s of line; track $index) {<ng-container *ngTemplateOutlet="span; context: { $implicit: s, block: bi }" />}</li>
                    }
                  </ul>
                }
                @if (open()?.block === bi) {
                  @let t = open()!.term;
                  <div class="gl-card" [id]="'gl-card-' + bi" role="region" [attr.aria-label]="t.term" (keydown.escape)="close(true)">
                    <div class="gl-card-head">
                      <strong><bdi dir="ltr">{{ t.term }}</bdi></strong>
                      <span class="muted" lang="ar" dir="rtl">{{ t.arabic }}</span>
                      <button type="button" class="btn btn-ghost btn-xs gl-card-close" (click)="close(true)" [attr.aria-label]="'common.close' | t">
                        <app-icon name="x" [size]="14" /></button>
                    </div>
                    <p>{{ i18n.pick(t.shortEn, t.shortAr) }}</p>
                    <div class="gl-card-links small">
                      @if (t.topicId !== topicId()) {
                        <a [routerLink]="['/topics', t.topicId]">{{ 'glossary.learnIt' | t }}: {{ i18n.pick(t.topicTitleEn, t.topicTitleAr) }}</a>
                      }
                      <a routerLink="/glossary" [queryParams]="{ q: t.term }">{{ 'glossary.title' | t }}</a>
                    </div>
                  </div>
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
  protected readonly i18n = inject(I18nService);
  private readonly glossary = inject(GlossaryService);
  readonly topicId = input.required<number>();
  /** The glossary term whose card is open, and the block (paragraph or list) it belongs to. */
  protected readonly open = signal<{ block: number; term: GlossaryTerm } | null>(null);
  private readonly data = createLoader(() => this.api.lessons(this.topicId()), { immediate: false });
  protected readonly lessons = computed<Lesson[]>(() => this.data.value() ?? []);
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.lessons()[this.index()] ?? null);
  private readonly matcher = computed(() => termMatcher(this.glossary.terms()));
  /** The lesson's blocks, with the first use of each glossary term marked (once per lesson). */
  protected readonly blocks = computed(() => {
    const l = this.current();
    if (!l) return [];
    const matcher = this.matcher();
    const used = new Set<string>();
    return lessonBlocks(this.i18n.pick(l.bodyEn, l.bodyAr))
      .map(b => ({ ...b, lines: b.lines.map(line => markTerms(line, matcher, used)) as TermSpan[][] }));
  });

  constructor() {
    void this.glossary.load();
    effect(() => {
      this.topicId();
      untracked(() => { this.index.set(0); this.open.set(null); void this.data.reload(); });
    });
  }

  protected go(i: number): void {
    this.open.set(null);
    this.index.set(Math.max(0, Math.min(i, this.lessons().length - 1)));
  }

  protected refId(block: number, term: GlossaryTerm): string {
    return `gl-ref-${block}-${term.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  protected isOpen(block: number, term: GlossaryTerm): boolean {
    const o = this.open();
    return !!o && o.block === block && o.term.term === term.term;
  }

  protected toggle(block: number, term: GlossaryTerm): void {
    this.open.set(this.isOpen(block, term) ? null : { block, term });
  }

  /** Closes the card; from the keyboard (Escape or its close button), focus goes back to the term. */
  protected close(returnFocus = false): void {
    const o = this.open();
    if (!o) return;
    this.open.set(null);
    if (returnFocus) setTimeout(() => document.getElementById(this.refId(o.block, o.term))?.focus(), 0);
  }
}

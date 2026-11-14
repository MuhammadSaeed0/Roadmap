import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CodeBlockComponent } from '../../shared/code-block.component';

export interface TextSegment { kind: 'text' | 'code'; text: string; language: string | null; }

const ALIASES: Record<string, string> = { cs: 'csharp', 'c#': 'csharp', ts: 'typescript', js: 'javascript', sh: 'bash' };

/**
 * Splits a post into plain text and ```fenced``` code. Text is rendered as text (never as HTML),
 * so a post can't inject markup; code goes through the shared highlighter, which escapes it.
 */
export function splitFences(source: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const fence = /```([\w#+-]*)[^\S\n]*\n?([\s\S]*?)```/g;
  let last = 0;
  for (const m of source.matchAll(fence)) {
    const before = source.slice(last, m.index).trim();
    if (before) segments.push({ kind: 'text', text: before, language: null });
    const lang = m[1].toLowerCase();
    segments.push({ kind: 'code', text: m[2].replace(/\n$/, ''), language: lang ? ALIASES[lang] ?? lang : null });
    last = m.index + m[0].length;
  }
  const rest = source.slice(last).trim();
  if (rest) segments.push({ kind: 'text', text: rest, language: null });
  return segments;
}

@Component({
  selector: 'app-discussion-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent],
  template: `
    @for (s of segments(); track $index) {
      @if (s.kind === 'code') {
        <app-code-block [code]="s.text" [language]="s.language" />
      } @else {
        <div class="discussion-text" dir="auto">{{ s.text }}</div>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
    .discussion-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
  `,
})
export class DiscussionTextComponent {
  readonly text = input.required<string>();
  protected readonly segments = computed(() => splitFences(this.text()));
}

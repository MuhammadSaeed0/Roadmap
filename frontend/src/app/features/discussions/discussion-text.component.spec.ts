import { TestBed } from '@angular/core/testing';
import { DiscussionTextComponent, splitFences } from './discussion-text.component';

describe('splitFences()', () => {
  it('separates text from fenced code and maps language aliases', () => {
    expect(splitFences('Why does this fail?\n```cs\nvar x = 1;\n```\nThanks')).toEqual([
      { kind: 'text', text: 'Why does this fail?', language: null },
      { kind: 'code', text: 'var x = 1;', language: 'csharp' },
      { kind: 'text', text: 'Thanks', language: null },
    ]);
  });

  it('keeps plain text as one segment and an unterminated fence as text', () => {
    expect(splitFences('just words')).toEqual([{ kind: 'text', text: 'just words', language: null }]);
    expect(splitFences('```js\nopen')).toEqual([{ kind: 'text', text: '```js\nopen', language: null }]);
  });
});

describe('DiscussionTextComponent', () => {
  it('renders markup in a post as text, never as HTML', async () => {
    const fixture = TestBed.createComponent(DiscussionTextComponent);
    fixture.componentRef.setInput('text', '<img src=x onerror="alert(1)"> hello\n```html\n<b>bold</b>\n```');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('b')).toBeNull();
    expect(el.textContent).toContain('<img src=x');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { MAX_TERMS_PER_LESSON, markTerms, termMatcher } from '../../core/glossary';
import { I18nService } from '../../core/i18n/i18n.service';
import { GlossaryTerm, Lesson } from '../../core/models';
import { TopicTutorialComponent, inlineSpans } from './topic-tutorial.component';

const term = (t: string, topicId = 50): GlossaryTerm =>
  ({ term: t, arabic: 'عربي ' + t, shortEn: `Meaning of ${t}.`, shortAr: `معنى ${t}.`, topicId, topicSlug: 's' + topicId, topicTitleEn: 'Topic ' + topicId, topicTitleAr: 'موضوع ' + topicId });

const glossary = [term('index', 51), term('clustered index', 52), term('interface', 53), term('repository (Git)', 54), term('LINQ', 7)];

describe('Glossary terms in lessons', () => {
  it('marks only the first use of each term, prefers the longer term and never touches code', () => {
    const matcher = termMatcher(glossary);
    const used = new Set<string>();
    const first = markTerms(inlineSpans('A clustered index sorts rows; another index helps. Use `interface` and an Interface.'), matcher, used);
    expect(first.filter(s => s.term).map(s => s.text)).toEqual(['clustered index', 'index', 'Interface']);
    expect(first.find(s => s.code)?.text).toBe('interface');
    // The same terms later in the lesson stay plain.
    const second = markTerms(inlineSpans('Each index and interface again.'), matcher, used);
    expect(second.some(s => s.term)).toBe(false);
    // The text itself is unchanged.
    expect(first.map(s => s.text).join('')).toBe('A clustered index sorts rows; another index helps. Use interface and an Interface.');
  });

  it('finds English terms inside Arabic text, skips qualified terms and caps the marks per lesson', () => {
    const matcher = termMatcher(glossary);
    const arabic = markTerms(inlineSpans('الواجهة (interface) تحدد عقدًا، والفهرس (index) يسرّع البحث.'), matcher, new Set());
    expect(arabic.filter(s => s.term).map(s => s.term!.term)).toEqual(['interface', 'index']);
    expect(markTerms(inlineSpans('a repository (Git) here'), matcher, new Set()).some(s => s.term)).toBe(false);

    const many = Array.from({ length: 10 }, (_, i) => term('word' + i));
    const capped = markTerms(inlineSpans(many.map(t => t.term).join(' ')), termMatcher(many), new Set());
    expect(capped.filter(s => s.term).length).toBe(MAX_TERMS_PER_LESSON);
  });

  it('opens a card from the keyboard, and Escape closes it and returns focus to the term', async () => {
    const lesson: Lesson = { id: 1, key: 'l1', order: 1, titleEn: 'Indexes', titleAr: 'الفهارس', bodyEn: 'A clustered index orders the rows.\n\nUse LINQ to query.',
      bodyAr: '', code: null, codeLanguage: null, output: null };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ApiService, useValue: { lessons: () => Promise.resolve([lesson]), glossary: () => Promise.resolve(glossary) } }],
    });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(TopicTutorialComponent);
    fixture.componentRef.setInput('topicId', 7);
    fixture.detectChanges();
    for (let i = 0; i < 3; i++) { await fixture.whenStable(); await new Promise(r => setTimeout(r, 0)); fixture.detectChanges(); }
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);

    const refs = [...el.querySelectorAll<HTMLButtonElement>('button.gl-ref')];
    expect(refs.map(r => r.textContent)).toEqual(['clustered index', 'LINQ']);
    const ref = refs[0];
    expect(ref.getAttribute('aria-expanded')).toBe('false');
    expect(ref.getAttribute('aria-label')).toBe('What does "clustered index" mean?');

    ref.focus();
    ref.click(); // a native <button>: Enter and Space click it
    fixture.detectChanges();
    expect(ref.getAttribute('aria-expanded')).toBe('true');
    const card = el.querySelector<HTMLElement>('#' + ref.getAttribute('aria-controls'))!;
    expect(card.textContent).toContain('Meaning of clustered index.');
    expect(card.querySelector('a[href="/topics/52"]')).not.toBeNull();
    expect(card.querySelector('a[href="/glossary?q=clustered%20index"]')).not.toBeNull();

    card.querySelector<HTMLButtonElement>('.gl-card-close')!.focus();
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 0));
    expect(el.querySelector('.gl-card')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('button.gl-ref'));

    // A term explained by this very topic doesn't link back to it.
    refs[1].click();
    fixture.detectChanges();
    expect(el.querySelector('.gl-card a[href="/topics/7"]')).toBeNull();
    el.remove();
  });
});

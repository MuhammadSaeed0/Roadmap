import { TestBed } from '@angular/core/testing';
import { ApiError } from '../core/api-error';
import { createLoader } from '../core/loader';
import { highlight } from './highlight';
import { ProgressRingComponent } from './ui.components';

describe('highlight()', () => {
  it('escapes HTML so code can never inject markup', () => {
    const html = highlight('<img src=x onerror="alert(1)">', 'html');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('marks keywords, strings and comments in C#', () => {
    const html = highlight('var name = "Sara"; // comment', 'csharp');
    expect(html).toContain('<span class="tok-keyword">var</span>');
    expect(html).toContain('<span class="tok-string">"Sara"</span>');
    expect(html).toContain('<span class="tok-comment">// comment</span>');
  });

  it('leaves plain text untouched', () => {
    expect(highlight('a < b', 'text')).toBe('a &lt; b');
  });
});

describe('createLoader()', () => {
  it('exposes loading, value and error states', async () => {
    const ok = TestBed.runInInjectionContext(() => createLoader(() => Promise.resolve(42), { immediate: false }));
    await ok.reload();
    expect(ok.value()).toBe(42);
    expect(ok.loading()).toBe(false);

    const failing = TestBed.runInInjectionContext(() =>
      createLoader(() => Promise.reject(new ApiError(404, 'not_found', 'missing')), { immediate: false }));
    await failing.reload();
    expect(failing.error()?.code).toBe('not_found');
    expect(failing.value()).toBeUndefined();
  });
});

describe('ProgressRingComponent', () => {
  it('renders the rounded percentage with an accessible label', async () => {
    const fixture = TestBed.createComponent(ProgressRingComponent);
    fixture.componentRef.setInput('value', 42.6);
    fixture.componentRef.setInput('label', 'Overall progress');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.ring-text')?.textContent?.trim()).toBe('43%');
    expect(el.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Overall progress');
  });
});

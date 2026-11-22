import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { GlossaryTerm } from '../../core/models';
import GlossaryPage, { arabicKey, matches } from './glossary.page';

const term = (t: string, arabic: string, topicId: number, shortEn = 'A definition.', shortAr = 'تعريف.'): GlossaryTerm =>
  ({ term: t, arabic, shortEn, shortAr, topicId, topicSlug: 'slug-' + topicId, topicTitleEn: 'Topic ' + topicId, topicTitleAr: 'موضوع ' + topicId });

const terms: GlossaryTerm[] = [
  term('middleware', 'الوسيط (Middleware)', 30, 'A step in the request pipeline.', 'خطوة في مسار الطلب.'),
  term('array', 'المصفوفة', 12),
  term('LINQ', 'لينك', 20, 'Query syntax in C#.', 'أسلوب استعلام في C#.'),
  term('index', 'الفهرس', 40),
];

async function render(lang: 'en' | 'ar' = 'en'): Promise<{ el: HTMLElement; fixture: ComponentFixture<GlossaryPage> }> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { glossary: () => Promise.resolve(terms) } }] });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(GlossaryPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

const shown = (el: HTMLElement) => [...el.querySelectorAll('.gl-term')].map(t => t.textContent?.trim());
const letters = (el: HTMLElement) => [...el.querySelectorAll('.gl-letter')].map(t => t.textContent?.trim());

describe('Glossary page', () => {
  it('lists terms A to Z under their letters, each linked to its topic', async () => {
    const { el } = await render('en');
    expect(shown(el)).toEqual(['array', 'index', 'LINQ', 'middleware']);
    expect(letters(el)).toEqual(['A', 'I', 'L', 'M']);
    const link = el.querySelector<HTMLAnchorElement>('.gl-item a.gl-topic')!;
    expect(link.getAttribute('href')).toBe('/topics/12');
    expect(link.textContent).toContain('Topic 12');
  });

  it('opens in Arabic order for Arabic readers, ignoring the article «ال»', async () => {
    const { el } = await render('ar');
    // فهرس، لينك، مصفوفة، وسيط
    expect(shown(el)).toEqual(['index', 'LINQ', 'array', 'middleware']);
    expect(letters(el)).toEqual(['ف', 'ل', 'م', 'و']);
    expect(el.querySelector('.gl-item dd p')?.textContent).toContain('تعريف');
  });

  it('searches in both languages and says when nothing matches', async () => {
    const { el, fixture } = await render('en');
    const input = el.querySelector<HTMLInputElement>('#gl-q')!;
    const search = (value: string) => { input.value = value; input.dispatchEvent(new Event('input')); fixture.detectChanges(); };

    search('pipeline');
    expect(shown(el)).toEqual(['middleware']);
    search('الفهرس');
    expect(shown(el)).toEqual(['index']);
    search('nothing like this');
    expect(el.textContent).toContain('No term matches this search.');
  });

  it('switches between the two orders', async () => {
    const { el, fixture } = await render('en');
    [...el.querySelectorAll<HTMLButtonElement>('.segmented button')].find(b => b.textContent === 'أ–ي')!.click();
    fixture.detectChanges();
    expect(shown(el)).toEqual(['index', 'LINQ', 'array', 'middleware']);
  });

  it('normalises Arabic for sorting and searching', () => {
    expect(arabicKey('الإجراء المخزَّن')).toBe('اجراء المخزَّن');
    expect(matches(terms[0], 'MIDDLEWARE')).toBe(true);
    expect(matches(terms[2], '')).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { I18nService } from '../../core/i18n/i18n.service';
import { AdminApiService, AdminUsage } from './admin-api.service';
import { AdminUsageComponent } from './admin-usage.component';

const usage: AdminUsage = {
  from: '2026-10-22', to: '2026-11-20', totalViews: 57,
  topPages: [{ route: 'topics/:id', views: 40, days: 9 }, { route: '', views: 17, days: 6 }],
  daily: Array.from({ length: 30 }, (_, i) => ({ date: `2026-11-${String((i % 28) + 1).padStart(2, '0')}`, views: i === 29 ? 12 : 1 })),
  library: { learnersStarted: 5, learnersFinished: 2, projectsFinished: 3 },
};

async function render(lang: 'en' | 'ar'): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [{ provide: AdminApiService, useValue: { usage: () => Promise.resolve(usage) } }] });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(AdminUsageComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('AdminUsageComponent', () => {
  it('shows totals, library uptake, a bar per day and the most opened pages', async () => {
    const el = await render('en');
    expect([...el.querySelectorAll('.stat-value')].map(v => v.textContent?.trim())).toEqual(['57', '5', '2', '3']);
    expect(el.querySelectorAll('.day').length).toBe(30);
    const rows = [...el.querySelectorAll('tbody tr')].map(r => [...r.querySelectorAll('td')].map(td => td.textContent?.trim()));
    expect(rows).toEqual([['/topics/:id', '40', '9'], ['/', '17', '6']]);
    expect(el.textContent).toContain('never who opened them');
  });

  it('is translated', async () => {
    const el = await render('ar');
    expect(el.textContent).toContain('أكثر الصفحات فتحًا');
    expect(el.querySelector('.route')?.getAttribute('dir')).toBe('ltr');
  });
});

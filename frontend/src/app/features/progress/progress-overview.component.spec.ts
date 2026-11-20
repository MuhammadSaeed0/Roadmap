import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProgressReport } from '../../core/models';
import { ProgressOverviewComponent } from './progress-overview.component';

const report = {
  confidence: [{ level: '5', count: 3 }, { level: 'unrated', count: 10 }],
  weeklyStudy: [{ weekStart: '2026-11-09', minutes: 120 }],
  totalMinutesStudied: 120,
  practice: [{ type: 'CodeKata', completed: 2, total: 10 }],
  interview: { confident: 1, partial: 2, needReview: 0, notPracticed: 5 },
  achievements: [],
  weakAreas: [{ topic: { id: 41, slug: 'sql-indexing', titleEn: 'Indexes', titleAr: 'الفهارس', status: 'InProgress' }, reason: 'lowConfidence' }],
} as unknown as ProgressReport;

async function render(lang: 'en' | 'ar'): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { progress: () => Promise.resolve(report) } }] });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(ProgressOverviewComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ProgressOverviewComponent', () => {
  it('shows confidence, study time, practice, interviews, achievements and weak areas', async () => {
    const el = await render('en');
    expect(el.querySelectorAll('section.card').length).toBe(6);
    expect(el.textContent).toContain('Confidence distribution');
    expect(el.querySelector('a[href="/topics/41"]')?.textContent).toContain('Indexes');
  });

  it('is translated', async () => {
    const el = await render('ar');
    expect(el.textContent).toContain('توزيع مستوى الثقة');
    expect(el.textContent).toContain('الفهارس');
  });
});

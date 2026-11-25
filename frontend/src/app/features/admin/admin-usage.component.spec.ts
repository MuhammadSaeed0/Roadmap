import { TestBed } from '@angular/core/testing';
import { I18nService } from '../../core/i18n/i18n.service';
import { AdminApiService, AdminUsage } from './admin-api.service';
import { Route } from '@angular/router';
import { routes } from '../../app.routes';
import { AdminUsageComponent, USAGE_DAYS, pageNameKey } from './admin-usage.component';

const usage: AdminUsage = {
  from: '2026-09-22', to: '2026-11-20', totalViews: 59,
  topPages: [{ route: 'topics/:id', views: 40, days: 9 }, { route: '', views: 17, days: 6 }, { route: 'old-page', views: 2, days: 1 }],
  daily: Array.from({ length: 60 }, (_, i) => ({ date: `2026-${i < 30 ? 10 : 11}-${String((i % 28) + 1).padStart(2, '0')}`, views: i === 59 ? 12 : 1 })),
  library: { learnersStarted: 5, learnersFinished: 2, projectsFinished: 3 },
  sources: [],
};

let requestedDays = 0;

async function render(lang: 'en' | 'ar'): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [{ provide: AdminApiService, useValue: { usage: (days: number) => { requestedDays = days; return Promise.resolve(usage); } } }] });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(AdminUsageComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('AdminUsageComponent', () => {
  it('shows totals, library uptake, a bar per day of the last 60 days and the most opened pages by name', async () => {
    const el = await render('en');
    expect(requestedDays).toBe(USAGE_DAYS);
    expect(USAGE_DAYS).toBe(60);
    expect([...el.querySelectorAll('.stat-value')].map(v => v.textContent?.trim())).toEqual(['59', '5', '2', '3']);
    expect(el.querySelectorAll('.day').length).toBe(60);
    const rows = [...el.querySelectorAll('section[aria-labelledby="usage-top-h"] tbody tr')].map(r => [
      r.querySelector('.page-name')?.textContent?.trim() ?? null, r.querySelector('.route')?.textContent?.trim(),
      ...[...r.querySelectorAll('td.num')].map(td => td.textContent?.trim()),
    ]);
    // A known page shows its name with the path under it; an unknown one shows the path only.
    expect(rows).toEqual([
      ['A roadmap topic', '/topics/:id', '40', '9'],
      ['Dashboard', '/', '17', '6'],
      [null, '/old-page', '2', '1'],
    ]);
    expect(el.textContent).toContain('Last 60 days');
    expect(el.textContent).toContain('never who opened them');
  });

  it('shows visits, new accounts and the sign-up rate per link source', async () => {
    usage.sources = [{ source: 'facebook', visits: 40, signUps: 6 }, { source: 'direct', visits: 0, signUps: 1 }];
    try {
      const el = await render('ar');
      const rows = [...el.querySelectorAll('section[aria-labelledby="usage-src-h"] tbody tr')]
        .map(r => [...r.querySelectorAll('td')].map(td => td.textContent?.trim()));
      expect(rows).toEqual([['facebook', '40', '6', '15%'], ['direct', '0', '1', '–']]);
      expect(el.textContent).toContain('من أين يأتي الزوار');
    } finally {
      usage.sources = [];
    }
  });

  it('lists accounts per roadmap, with those who have not chosen yet', async () => {
    usage.roadmaps = [
      { slug: 'dotnet-fullstack', titleEn: '.NET full-stack developer', titleAr: 'مطوّر Full-Stack بـ .NET', learners: 30 },
      { slug: 'ai-app-developer', titleEn: 'AI application developer', titleAr: 'مطوّر تطبيقات الذكاء الاصطناعي', learners: 4 },
      { slug: '', titleEn: '', titleAr: '', learners: 2 },
    ];
    try {
      const el = await render('en');
      const rows = [...el.querySelectorAll('section[aria-labelledby="usage-roadmaps-h"] tbody tr')]
        .map(r => [...r.querySelectorAll('td')].map(td => td.textContent?.trim()));
      expect(rows).toEqual([['.NET full-stack developer', '30'], ['AI application developer', '4'], ['Not chosen yet', '2']]);
    } finally {
      usage.roadmaps = undefined;
    }
  });

  it('names every page a signed-in learner can open', () => {
    const patterns = (routes: Route[], prefix = ''): string[] => routes.flatMap(r => {
      if (r.redirectTo || r.path === undefined || r.path === '**') return [];
      const path = [prefix, r.path].filter(Boolean).join('/');
      return [path, ...patterns(r.children ?? [], path)];
    });
    const unnamed = [...new Set(patterns(routes))].filter(p => !pageNameKey(p)
      && !['sign-in', 'sign-up', 'forgot-password', 'reset-password'].includes(p));
    expect(unnamed).toEqual([]);
    const i18n = TestBed.inject(I18nService);
    for (const lang of ['en', 'ar'] as const) {
      i18n.lang.set(lang);
      for (const p of patterns(routes)) {
        const key = pageNameKey(p);
        if (key) expect(i18n.has(key), `${lang} ${key}`).toBe(true);
      }
    }
  });

  it('is translated', async () => {
    const el = await render('ar');
    expect(el.textContent).toContain('أكثر الصفحات فتحًا');
    expect(el.querySelector('.page-name')?.textContent).toContain('صفحة موضوع');
    expect(el.querySelector('.route')?.getAttribute('dir')).toBe('ltr');
  });
});

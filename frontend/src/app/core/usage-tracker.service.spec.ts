import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';
import { UsageTracker } from './usage-tracker.service';

@Component({ template: '' })
class Blank {}

function setup(signedIn: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(), provideHttpClientTesting(),
      provideRouter([
        { path: '', component: Blank },
        { path: 'topics/:id', component: Blank },
        { path: 'u/:handle', component: Blank },
      ]),
      { provide: API_BASE_URL, useValue: '/api' },
      { provide: AuthService, useValue: { account: signal(signedIn ? { fullName: 'A' } : null) } },
    ],
  });
  TestBed.runInInjectionContext(() => TestBed.inject(UsageTracker).start());
  return { router: TestBed.inject(Router), http: TestBed.inject(HttpTestingController) };
}

describe('UsageTracker', () => {
  it('sends the route pattern, never ids, handles or the query string', async () => {
    const { router, http } = setup(true);
    await router.navigateByUrl('/topics/42?tab=notes');
    const sent = http.expectOne('/api/usage/page-views');
    expect(sent.request.body).toEqual({ route: 'topics/:id' });
    sent.flush(null);

    await router.navigateByUrl('/u/someone');
    expect(http.expectOne('/api/usage/page-views').request.body).toEqual({ route: 'u/:handle' });
    await router.navigateByUrl('/');
    expect(http.expectOne('/api/usage/page-views').request.body).toEqual({ route: '' });
    http.verify();
  });

  it('does not count a query-only change (a tab or filter) as a new view', async () => {
    const { router, http } = setup(true);
    await router.navigateByUrl('/topics/1');
    http.expectOne('/api/usage/page-views').flush(null);
    await router.navigateByUrl('/topics/1?tab=quiz');
    http.expectNone('/api/usage/page-views');
  });

  it('sends nothing when nobody is signed in', async () => {
    const { router, http } = setup(false);
    await router.navigateByUrl('/topics/1');
    http.expectNone('/api/usage/page-views');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';
import { rememberedSource, sourceFromUrl } from './source';
import { SourceTracker } from './source-tracker.service';

describe('SourceTracker', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('reads a short source word from utm_source or ref, and nothing else', () => {
    expect(sourceFromUrl('?utm_source=Facebook&utm_campaign=x')).toBe('facebook');
    expect(sourceFromUrl('?ref=reddit')).toBe('reddit');
    expect(sourceFromUrl('?utm_source=a%40b.com')).toBeNull();
    expect(sourceFromUrl('')).toBeNull();
  });

  function setup(signedIn: boolean) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }],
    });
    const auth = TestBed.inject(AuthService);
    auth.account.set(signedIn ? ({ email: 'a@b.c' } as never) : null);
    auth.ready.set(true);
    return { tracker: TestBed.inject(SourceTracker), http: TestBed.inject(HttpTestingController) };
  }

  it('counts one guest visit per session with the first source seen', () => {
    const { tracker, http } = setup(false);
    tracker.start('?utm_source=linkedin');
    TestBed.tick();
    const req = http.expectOne('/api/usage/visits');
    expect(req.request.body).toEqual({ source: 'linkedin' });
    req.flush(null);

    // A later link in the same session keeps the first source and sends no second visit.
    tracker.start('?utm_source=tiktok');
    TestBed.tick();
    http.expectNone('/api/usage/visits');
    expect(rememberedSource()).toBe('linkedin');
  });

  it('sends nothing for a signed-in learner', () => {
    const { tracker, http } = setup(true);
    tracker.start('?utm_source=facebook');
    TestBed.tick();
    http.expectNone('/api/usage/visits');
  });
});

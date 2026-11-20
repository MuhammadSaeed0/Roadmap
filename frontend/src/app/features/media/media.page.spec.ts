import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Route, Router, UrlTree } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../../app.routes';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import MediaPage from './media.page';

const never = () => new Promise<never>(() => undefined);

async function render(section: string | null) {
  const query = new BehaviorSubject(convertToParamMap(section ? { section } : {}));
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { videoLibrary: never, savedVideos: never, resources: never, phases: never } },
      { provide: ActivatedRoute, useValue: { queryParamMap: query, snapshot: { queryParamMap: query.value } } },
    ],
  });
  TestBed.inject(I18nService).lang.set('en');
  const fixture = TestBed.createComponent(MediaPage);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, fixture, query };
}

describe('MediaPage', () => {
  it('shows videos by default and resources when asked', async () => {
    const { el, fixture, query } = await render(null);
    expect([...el.querySelectorAll('[role="tab"]')].map(t => t.textContent?.trim())).toEqual(['Videos', 'Reading resources']);
    expect(el.querySelector('app-video-library-page')).not.toBeNull();
    expect(el.querySelector('app-resources-page')).toBeNull();

    query.next(convertToParamMap({ section: 'resources' }));
    fixture.detectChanges();
    expect(el.querySelector('app-resources-page')).not.toBeNull();
    expect(el.querySelector('#media-tab-resources')?.getAttribute('aria-selected')).toBe('true');
  });

  it('sends the old /videos and /resources links to their tab, keeping their filters', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const router = TestBed.inject(Router);
    const redirect = (path: string, queryParams: Record<string, string>) => {
      const route = routes.find(r => r.path === path) as Route;
      const fn = route.redirectTo as (r: { queryParams: Record<string, string> }) => UrlTree;
      return router.serializeUrl(TestBed.runInInjectionContext(() => fn({ queryParams })));
    };
    expect(redirect('videos', { tab: 'saved' })).toBe('/media?tab=saved&section=videos');
    expect(redirect('resources', {})).toBe('/media?section=resources');
  });
});

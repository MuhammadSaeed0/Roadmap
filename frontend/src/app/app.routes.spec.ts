import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlTree, convertToParamMap, provideRouter } from '@angular/router';
import { routes } from './app.routes';

function find(list: Route[], path: string): Route | undefined {
  for (const route of list) {
    if (route.path === path) return route;
    const child = route.children && find(route.children, path);
    if (child) return child;
  }
  return undefined;
}

describe('routes', () => {
  it('has separate video and resources pages, and /media opens the matching one with its filters', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    expect(find(routes, 'videos')?.loadComponent).toBeTruthy();
    expect(find(routes, 'resources')?.loadComponent).toBeTruthy();

    const redirect = find(routes, 'media')!.redirectTo as (snapshot: unknown) => UrlTree;
    const open = (queryParams: Record<string, string>) => TestBed.inject(Router).serializeUrl(
      TestBed.runInInjectionContext(() => redirect({ queryParams, queryParamMap: convertToParamMap(queryParams) })));
    expect(open({ section: 'resources', type: 'Docs' })).toBe('/resources?type=Docs');
    expect(open({ section: 'videos', tab: 'saved' })).toBe('/videos?tab=saved');
    expect(open({})).toBe('/videos');
  });
});

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.service';
import { IdlePreloading } from './core/idle-preloading';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route params such as :id arrive as component input() values.
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Lazy pages download in the background after start-up (see IdlePreloading).
      withPreloading(IdlePreloading)),
    // authInterceptor sends the session cookie to the API and notices when the session ends.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // To point the app at a different API: { provide: API_BASE_URL, useValue: 'http://localhost:5080/api' }
  ],
};

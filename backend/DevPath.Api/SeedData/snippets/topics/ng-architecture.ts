// main.ts — the entry point
bootstrapApplication(App, appConfig).catch(err => console.error(err));

// app.config.ts — app-wide providers
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};

// src/app/
//   core/       api client, i18n, theme (singletons)
//   shared/     reusable UI components
//   layout/     the application shell
//   features/   one folder per screen, lazy-loaded

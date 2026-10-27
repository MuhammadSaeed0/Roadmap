import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

const appRoutes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.page'), data: { titleKey: 'nav.dashboard' } },
  { path: 'roadmap', loadComponent: () => import('./features/roadmap/roadmap.page'), data: { titleKey: 'nav.roadmap' } },
  { path: 'library', loadComponent: () => import('./features/library/library.page'), data: { titleKey: 'nav.library' } },
  { path: 'topics/:id', loadComponent: () => import('./features/topics/topic-detail.page'), data: { titleKey: 'nav.library' } },
  { path: 'projects', loadComponent: () => import('./features/projects/projects.page'), data: { titleKey: 'nav.projects' } },
  { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail.page'), data: { titleKey: 'nav.projects' } },
  { path: 'practice', loadComponent: () => import('./features/practice/practice.page'), data: { titleKey: 'nav.practice' } },
  { path: 'practice/:id', loadComponent: () => import('./features/practice/exercise-detail.page'), data: { titleKey: 'nav.practice' } },
  { path: 'interviews', loadComponent: () => import('./features/interviews/interviews.page'), data: { titleKey: 'nav.interviews' } },
  { path: 'resources', loadComponent: () => import('./features/resources/resources.page'), data: { titleKey: 'nav.resources' } },
  { path: 'notes', loadComponent: () => import('./features/notes/notes.page'), data: { titleKey: 'nav.notes' } },
  { path: 'progress', loadComponent: () => import('./features/progress/progress.page'), data: { titleKey: 'nav.progress' } },
  { path: 'career', loadComponent: () => import('./features/career/career.page'), data: { titleKey: 'nav.career' } },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.page'), data: { titleKey: 'nav.settings' } },
  { path: 'search', loadComponent: () => import('./features/search/search.page'), data: { titleKey: 'nav.search' } },
  { path: '**', loadComponent: () => import('./features/not-found.page'), data: { titleKey: 'notFound.title' } },
];

// Account pages use the minimal `auth` layout (no sidebar). guestGuard sends signed-in users to the app.
const authRoutes: Routes = [
  { path: 'sign-in', loadComponent: () => import('./features/auth/sign-in.page'), data: { titleKey: 'auth.signInTitle' } },
  { path: 'sign-up', loadComponent: () => import('./features/auth/sign-up.page'), data: { titleKey: 'auth.signUpTitle' } },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.page'), data: { titleKey: 'auth.forgotTitle' } },
  // Opened from the reset link (it carries the email and a one-time token).
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.page'), data: { titleKey: 'auth.resetTitle' } },
];

// Every other page needs a signed-in account; the API enforces the same rule on every request.
// Every feature page is lazy-loaded, so the initial bundle stays small.
// `titleKey` is the translation key shown in the top bar breadcrumb.
export const routes: Routes = [
  ...authRoutes.map((route) => ({ ...route, canActivate: [guestGuard], data: { ...route.data, layout: 'auth' } })),
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password.page'), canActivate: [authGuard], data: { titleKey: 'auth.changePassword', layout: 'auth' } },
  ...appRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
];

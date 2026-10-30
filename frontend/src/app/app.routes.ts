import { Routes } from '@angular/router';
import { accountStatusGuard, adminGuard, authGuard, guestGuard } from './core/auth.guard';

const appRoutes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.page'), data: { titleKey: 'nav.dashboard', helpId: 'dashboard' } },
  { path: 'roadmap', loadComponent: () => import('./features/roadmap/roadmap.page'), data: { titleKey: 'nav.roadmap', helpId: 'roadmap' } },
  { path: 'library', loadComponent: () => import('./features/library/library.page'), data: { titleKey: 'nav.library', helpId: 'library' } },
  { path: 'topics/:id', loadComponent: () => import('./features/topics/topic-detail.page'), data: { titleKey: 'nav.library', helpId: 'topic' } },
  { path: 'projects', loadComponent: () => import('./features/projects/projects.page'), data: { titleKey: 'nav.projects', helpId: 'projects' } },
  { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail.page'), data: { titleKey: 'nav.projects', helpId: 'project' } },
  { path: 'practice', loadComponent: () => import('./features/practice/practice.page'), data: { titleKey: 'nav.practice', helpId: 'practice' } },
  { path: 'practice/:id', loadComponent: () => import('./features/practice/exercise-detail.page'), data: { titleKey: 'nav.practice', helpId: 'exercise' } },
  { path: 'interviews', loadComponent: () => import('./features/interviews/interviews.page'), data: { titleKey: 'nav.interviews', helpId: 'interviews' } },
  { path: 'resources', loadComponent: () => import('./features/resources/resources.page'), data: { titleKey: 'nav.resources', helpId: 'resources' } },
  { path: 'notes', loadComponent: () => import('./features/notes/notes.page'), data: { titleKey: 'nav.notes', helpId: 'notes' } },
  { path: 'progress', loadComponent: () => import('./features/progress/progress.page'), data: { titleKey: 'nav.progress', helpId: 'progress' } },
  { path: 'career', loadComponent: () => import('./features/career/career.page'), data: { titleKey: 'nav.career', helpId: 'career' } },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.page'), data: { titleKey: 'nav.settings', helpId: 'settings' } },
  { path: 'search', loadComponent: () => import('./features/search/search.page'), data: { titleKey: 'nav.search', helpId: 'search' } },
  { path: 'admin', loadComponent: () => import('./features/admin/admin.page'), canActivate: [adminGuard], data: { titleKey: 'nav.admin', helpId: 'admin' } },
  { path: '**', loadComponent: () => import('./features/not-found.page'), data: { titleKey: 'notFound.title' } },
];

// Account pages use the minimal `auth` layout (no sidebar). guestGuard sends signed-in users to the app.
const authRoutes: Routes = [
  { path: 'sign-in', loadComponent: () => import('./features/auth/sign-in.page'), data: { titleKey: 'auth.signInTitle' } },
  { path: 'sign-up', loadComponent: () => import('./features/auth/sign-up.page'), data: { titleKey: 'auth.signUpTitle' } },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.page'), data: { titleKey: 'auth.forgotTitle' } },
  // Opened from the reset link (it carries a one-time token).
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.page'), data: { titleKey: 'auth.resetTitle' } },
];

// Every other page needs a signed-in account; the API enforces the same rule on every request.
// Every feature page is lazy-loaded, so the initial bundle stays small.
// `titleKey` is the translation key shown in the top bar breadcrumb; `helpId` names the page's guide in the Help menu (core/tour).
export const routes: Routes = [
  ...authRoutes.map((route) => ({ ...route, canActivate: [guestGuard], data: { ...route.data, layout: 'auth' } })),
  // Opened from the verification email; works whether or not this browser is signed in.
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email.page'), data: { titleKey: 'verify.title', layout: 'auth' } },
  // Where signed-in accounts wait for verification or approval, or learn that they were rejected or suspended.
  { path: 'account-status', loadComponent: () => import('./features/auth/account-status.page'), canActivate: [accountStatusGuard], data: { titleKey: 'status.title', layout: 'auth' } },
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password.page'), canActivate: [authGuard], data: { titleKey: 'auth.changePassword', layout: 'auth' } },
  ...appRoutes.map((route) => ({ ...route, canActivate: [authGuard, ...(route.canActivate ?? [])] })),
];

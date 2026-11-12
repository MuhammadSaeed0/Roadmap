import { Routes } from '@angular/router';
import { accountStatusGuard, adminGuard, authGuard, guestGuard } from './core/auth.guard';

const appRoutes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.page'), data: { titleKey: 'nav.dashboard', helpId: 'dashboard', skin: 'feed' } },
  { path: 'roadmap', loadComponent: () => import('./features/roadmap/roadmap.page'), data: { titleKey: 'nav.roadmap', helpId: 'roadmap', skin: 'gram' } },
  { path: 'library', loadComponent: () => import('./features/library/library.page'), data: { titleKey: 'nav.library', helpId: 'library', skin: 'threads' } },
  { path: 'topics/:id', loadComponent: () => import('./features/topics/topic-detail.page'), data: { titleKey: 'nav.library', helpId: 'topic', skin: 'threads' } },
  { path: 'projects', loadComponent: () => import('./features/projects/projects.page'), data: { titleKey: 'nav.projects', helpId: 'projects', skin: 'gram' } },
  { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail.page'), data: { titleKey: 'nav.projects', helpId: 'project', skin: 'gram' } },
  { path: 'practice', loadComponent: () => import('./features/practice/practice.page'), data: { titleKey: 'nav.practice', helpId: 'practice', skin: 'threads' } },
  { path: 'practice/:id', loadComponent: () => import('./features/practice/exercise-detail.page'), data: { titleKey: 'nav.practice', helpId: 'exercise', skin: 'threads' } },
  { path: 'playground', loadComponent: () => import('./features/playground/playground.page'), data: { titleKey: 'nav.playground', helpId: 'playground', skin: 'tube' } },
  { path: 'playground/new/:template', loadComponent: () => import('./features/playground/workspace.page'), data: { titleKey: 'nav.playground', helpId: 'workspace', skin: 'tube' } },
  { path: 'playground/:id', loadComponent: () => import('./features/playground/workspace.page'), data: { titleKey: 'nav.playground', helpId: 'workspace', skin: 'tube' } },
  { path: 'videos', loadComponent: () => import('./features/videos/video-library.page'), data: { titleKey: 'nav.videos', helpId: 'videos', skin: 'tube' } },
  { path: 'interviews', loadComponent: () => import('./features/interviews/interviews.page'), data: { titleKey: 'nav.interviews', helpId: 'interviews', skin: 'chatblue' } },
  { path: 'resources', loadComponent: () => import('./features/resources/resources.page'), data: { titleKey: 'nav.resources', helpId: 'resources', skin: 'bird' } },
  { path: 'notes', loadComponent: () => import('./features/notes/notes.page'), data: { titleKey: 'nav.notes', helpId: 'notes', skin: 'chatgreen' } },
  { path: 'progress', loadComponent: () => import('./features/progress/progress.page'), data: { titleKey: 'nav.progress', helpId: 'progress', skin: 'snap' } },
  { path: 'cv', loadComponent: () => import('./features/cv/cv-dashboard.page'), data: { titleKey: 'nav.cv', helpId: 'cv', skin: 'pro' } },
  { path: 'cv/:id', loadComponent: () => import('./features/cv/cv-editor.page'), data: { titleKey: 'nav.cv', helpId: 'cv-editor', skin: 'pro' } },
  { path: 'career', loadComponent: () => import('./features/career/career.page'), data: { titleKey: 'nav.career', helpId: 'career', skin: 'pro' } },
  { path: 'skills', loadComponent: () => import('./features/skills/skill-level.page'), data: { titleKey: 'nav.skills', helpId: 'skills', skin: 'pro' } },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.page'), data: { titleKey: 'nav.settings', helpId: 'settings', skin: 'chatblue' } },
  { path: 'search', loadComponent: () => import('./features/search/search.page'), data: { titleKey: 'nav.search', helpId: 'search', skin: 'bird' } },
  { path: 'admin', loadComponent: () => import('./features/admin/admin.page'), canActivate: [adminGuard], data: { titleKey: 'nav.admin', helpId: 'admin', skin: 'pro' } },
  { path: '**', loadComponent: () => import('./features/not-found.page'), data: { titleKey: 'notFound.title', skin: 'bird' } },
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
  ...authRoutes.map((route) => ({ ...route, canActivate: [guestGuard], data: { ...route.data, layout: 'auth', skin: 'feed' } })),
  // Opened from the verification email; works whether or not this browser is signed in.
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email.page'), data: { titleKey: 'verify.title', layout: 'auth', skin: 'feed' } },
  // Where signed-in accounts wait for verification or approval, or learn that they were rejected or suspended.
  { path: 'account-status', loadComponent: () => import('./features/auth/account-status.page'), canActivate: [accountStatusGuard], data: { titleKey: 'status.title', layout: 'auth', skin: 'feed' } },
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password.page'), canActivate: [authGuard], data: { titleKey: 'auth.changePassword', layout: 'auth', skin: 'feed' } },
  ...appRoutes.map((route) => ({ ...route, canActivate: [authGuard, ...(route.canActivate ?? [])] })),
];

import { Routes } from '@angular/router';

// Every feature page is lazy-loaded, so the initial bundle stays small.
// `titleKey` is the translation key shown in the top bar breadcrumb.
export const routes: Routes = [
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

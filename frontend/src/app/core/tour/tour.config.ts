/**
 * What the onboarding tour and the help menu cover. Everything is keyed by the `data-tour`
 * attribute on the element being explained, so the texts (tour-content.en/ar.ts) and the
 * templates only have to agree on these ids. To explain a new part of the app:
 * add its id to SECTION_IDS, put `data-tour="<id>"` on the element, list it under its page
 * in PAGE_HELP (and in MAIN_TOUR if the first-run tour should show it), then write its text
 * in both language files (the TypeScript types make a missing translation a build error).
 */

/** Every explainable element. The value is the element's `data-tour` attribute. */
export const SECTION_IDS = [
  // App shell
  'nav', 'menu', 'search', 'quick-add', 'prefs', 'account', 'help',
  // Dashboard
  'dashboard-hero', 'dashboard-today', 'dashboard-continue', 'dashboard-plan', 'dashboard-skills',
  'dashboard-projects', 'dashboard-activity', 'dashboard-actions',
  // Roadmap and library
  'roadmap-header', 'roadmap-phases', 'library-filters', 'library-list',
  // Topic page
  'topic-header', 'topic-content', 'topic-videos', 'topic-quiz', 'topic-progress', 'topic-notes', 'topic-related',
  // Projects
  'projects-list', 'project-hero', 'project-milestones', 'project-changes', 'project-portfolio', 'project-repo',
  // Practice
  'practice-types', 'practice-filters', 'practice-list', 'exercise-problem', 'exercise-attempt', 'exercise-hints', 'exercise-solution',
  // Interviews, resources, notes
  'interviews-modes', 'interviews-categories', 'interviews-filters', 'interviews-list',
  'resources-verify', 'resources-filters', 'resources-list', 'notes-new', 'notes-list', 'notes-editor',
  // Progress, career, settings, search, admin
  'progress-tabs', 'progress-panel', 'career-gaps', 'career-areas', 'career-portfolio',
  'settings-appearance', 'settings-learning', 'settings-account', 'settings-about', 'search-results',
  'admin-stats', 'admin-tabs', 'admin-users',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Pages with a guide. Routes name theirs in `data.helpId` (see app.routes.ts), so /topics/:id etc. work. */
export const HELP_IDS = [
  'dashboard', 'roadmap', 'library', 'topic', 'projects', 'project', 'practice', 'exercise', 'interviews',
  'resources', 'notes', 'progress', 'career', 'settings', 'search', 'admin',
] as const;
export type HelpId = (typeof HELP_IDS)[number];

/** The sections each page guide walks through, in reading order. */
export const PAGE_HELP: Record<HelpId, readonly SectionId[]> = {
  dashboard: ['dashboard-hero', 'dashboard-today', 'dashboard-continue', 'dashboard-plan', 'dashboard-skills',
    'dashboard-projects', 'dashboard-activity', 'dashboard-actions'],
  roadmap: ['roadmap-header', 'roadmap-phases'],
  library: ['library-filters', 'library-list'],
  topic: ['topic-header', 'topic-content', 'topic-videos', 'topic-quiz', 'topic-progress', 'topic-notes', 'topic-related'],
  projects: ['projects-list'],
  project: ['project-hero', 'project-milestones', 'project-changes', 'project-portfolio', 'project-repo'],
  practice: ['practice-types', 'practice-filters', 'practice-list'],
  exercise: ['exercise-problem', 'exercise-attempt', 'exercise-hints', 'exercise-solution'],
  interviews: ['interviews-modes', 'interviews-categories', 'interviews-filters', 'interviews-list'],
  resources: ['resources-verify', 'resources-filters', 'resources-list'],
  notes: ['notes-new', 'notes-list', 'notes-editor'],
  progress: ['progress-tabs', 'progress-panel'],
  career: ['career-gaps', 'career-areas', 'career-portfolio'],
  settings: ['settings-appearance', 'settings-learning', 'settings-account', 'settings-about'],
  search: ['search-results'],
  admin: ['admin-stats', 'admin-tabs', 'admin-users'],
};

export interface TourContext { isAdmin: boolean; }

/** One step of the first-run tour. `targets` are tried in order; the first one on screen is highlighted. */
export interface MainStep {
  id: SectionId | 'welcome' | 'finish';
  route?: string;
  targets?: readonly SectionId[];
  when?: (ctx: TourContext) => boolean;
}

/** The first-run tour: the shell, then one stop per main page, then where to find help later. */
export const MAIN_TOUR: readonly MainStep[] = [
  { id: 'welcome', route: '/' },
  { id: 'nav', route: '/', targets: ['nav', 'menu'] },
  { id: 'search', route: '/', targets: ['search'] },
  { id: 'quick-add', route: '/', targets: ['quick-add'] },
  { id: 'prefs', route: '/', targets: ['prefs'] },
  { id: 'dashboard-hero', route: '/', targets: ['dashboard-hero'] },
  { id: 'dashboard-continue', route: '/', targets: ['dashboard-continue'] },
  { id: 'dashboard-plan', route: '/', targets: ['dashboard-plan'] },
  { id: 'roadmap-phases', route: '/roadmap', targets: ['roadmap-phases', 'roadmap-header'] },
  { id: 'library-filters', route: '/library', targets: ['library-filters'] },
  { id: 'projects-list', route: '/projects', targets: ['projects-list'] },
  { id: 'practice-types', route: '/practice', targets: ['practice-types'] },
  { id: 'interviews-modes', route: '/interviews', targets: ['interviews-modes'] },
  { id: 'resources-filters', route: '/resources', targets: ['resources-filters'] },
  { id: 'notes-list', route: '/notes', targets: ['notes-list'] },
  { id: 'progress-tabs', route: '/progress', targets: ['progress-tabs'] },
  { id: 'career-gaps', route: '/career', targets: ['career-gaps'] },
  { id: 'settings-learning', route: '/settings', targets: ['settings-learning'] },
  { id: 'admin-stats', route: '/admin', targets: ['admin-stats'], when: ctx => ctx.isAdmin },
  { id: 'help', targets: ['help'] },
  { id: 'finish' },
];

export const isSectionId = (value: string | null | undefined): value is SectionId =>
  !!value && (SECTION_IDS as readonly string[]).includes(value);

export const isHelpId = (value: unknown): value is HelpId =>
  typeof value === 'string' && (HELP_IDS as readonly string[]).includes(value);

export const tourSelector = (id: SectionId): string => `[data-tour="${id}"]`;

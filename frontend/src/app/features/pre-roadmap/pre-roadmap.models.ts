import { Difficulty, VideoLanguage } from '../../core/models';

/** Text in both interface languages. */
export interface Bilingual { en: string; ar: string }

export interface PreVideo {
  videoId: string; title: string; channel: string; language: VideoLanguage; durationSeconds: number | null;
}

/** An outside course, book or documentation site (checked to open). */
export interface PreResource { name: string; url: string; note: Bilingual; language: VideoLanguage }

/** Where on this site an item continues: roadmap phases, learning paths and topics, by slug (resolved at runtime). */
export interface PreLinks { phases?: string[]; paths?: string[]; topics?: string[] }

export interface IntroQuestion { id: string; icon: string; question: Bilingual; answer: Bilingual[] }

export type FieldCategory = 'web' | 'apps' | 'data' | 'systems';

export interface CareerField {
  id: string;
  icon: string;
  category: FieldCategory;
  title: Bilingual;
  summary: Bilingual;
  /** Things people use every day that are built in this field. */
  examples: Bilingual[];
  /** Languages, frameworks and tools common in the field (shown left to right). */
  technologies: string[];
  /** What to learn first, and why it is a good first choice. */
  startWith: { name: string; why: Bilingual }[];
  skills: Bilingual[];
  difficulty: Difficulty;
  prerequisites: Bilingual;
  resources: PreResource[];
  nextSteps: Bilingual[];
  /** How this site's roadmap relates to the field; said plainly when it does not cover it. */
  siteFit: Bilingual;
  links: PreLinks;
}

export type FundamentalGroup = 'thinking' | 'code' | 'tools' | 'work';

export interface Fundamental {
  id: string;
  icon: string;
  group: FundamentalGroup;
  title: Bilingual;
  summary: Bilingual;
  why: Bilingual;
  resources: PreResource[];
  links: PreLinks;
}

/** A link to a place on this site, resolved from a slug once the roadmap and the paths have loaded. */
export interface SiteLink { kind: 'phase' | 'path' | 'topic'; label: string; route: string[]; fragment?: string }

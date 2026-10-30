import { HelpId, SectionId } from './tour.config';

export interface TourText { title: string; body: string; }

/**
 * All onboarding and help texts for one language. Kept out of en.ts/ar.ts and loaded on demand,
 * so they don't add to the app's first download. Both languages implement this interface,
 * so a section without a translation fails the build.
 */
export interface TourContent {
  ui: {
    welcomeEyebrow: string; welcomeTitle: string; welcomeBody: string; welcomePoints: string[];
    startTour: string; skipIntro: string; tourLength: string;
    next: string; back: string; skip: string; close: string; done: string; stepOf: string;
    notOnScreen: string;
    helpButton: string; helpMenu: string;
    continueTour: string; continueHint: string; explore: string; exploreHint: string;
    thisPage: string; thisPageHint: string; pick: string; pickHint: string; quick: string; quickHint: string;
    pickBanner: string; pickStop: string; pickAnother: string;
    quickTitle: string; sectionsTitle: string; showMe: string; pageTour: string; tipsTitle: string; noPageHelp: string;
    tourSkipped: string; tourDone: string;
  };
  steps: { welcome: TourText; finish: TourText; };
  pages: Record<HelpId, { title: string; summary: string; }>;
  sections: Record<SectionId, TourText>;
  tips: string[];
}

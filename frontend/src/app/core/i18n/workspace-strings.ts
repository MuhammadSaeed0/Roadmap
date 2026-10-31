import { registerTranslations } from './i18n.service';
import { workspaceAr } from './workspace.ar';
import { workspaceEn } from './workspace.en';

// Imported for its effect by the code editor, the Code Playground and the video library: their strings
// load with those pages instead of with the app's first download.
registerTranslations(workspaceEn, workspaceAr);

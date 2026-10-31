import { TestBed } from '@angular/core/testing';
import { CvApiService, CvContent, CvStyle, CvTemplate, SECTION_KEYS } from './cv-api.service';
import { CvEditorState } from './cv-editor.state';

const template = (key: string, accent: string, font: string, color = true, photo = true): CvTemplate => ({
  key, nameEn: key, nameAr: key, descriptionEn: '', descriptionAr: '', defaultAccent: accent, defaultFont: font,
  supportsColor: color, supportsPhoto: photo, atsFriendly: !color, defaultOrder: [...SECTION_KEYS],
});
const templates = [template('modern', '#2563eb', 'sans'), template('ats', '#111111', 'sans', false, false), template('executive', '#1e3a5f', 'serif')];
const content: CvContent = {
  personal: { fullName: 'Sara', title: '', email: '', phone: '', location: '', linkedIn: '', gitHub: '', website: '' },
  summary: 'Builds web apps.', education: [], experience: [], skills: [{ category: 'Backend', items: ['C#'] }],
  projects: [], certifications: [], languages: [], sections: [],
};
const style: CvStyle = { accent: '#2563eb', font: 'sans', sectionOrder: [...SECTION_KEYS], hidden: [], density: 'comfortable', direction: 'ltr', showPhoto: true };

describe('CvEditorState', () => {
  let state: CvEditorState;
  let saves: unknown[];

  beforeEach(() => {
    saves = [];
    TestBed.configureTestingModule({
      providers: [CvEditorState, {
        provide: CvApiService,
        useValue: {
          update: async (_: number, body: { content: CvContent; style: CvStyle; title: string; templateKey: string }) => {
            saves.push(body);
            return { summary: { id: 1, title: body.title, templateKey: body.templateKey }, content: body.content, style: body.style };
          },
          preview: async () => ({ pageCount: 1, pages: ['data:image/webp;base64,'] }),
        },
      }],
    });
    state = TestBed.inject(CvEditorState);
    state.load({ summary: { id: 1, title: 'CV', templateKey: 'modern', parentId: null, tailoredFor: null, hasPhoto: false, createdAt: '', updatedAt: '' }, content, style }, templates);
  });

  it('keeps the content when the template changes, and follows the new template’s defaults', () => {
    state.setTemplate('executive');
    expect(state.templateKey()).toBe('executive');
    expect(state.content()).toEqual(content);
    expect(state.style()!.accent).toBe('#1e3a5f');
    expect(state.style()!.font).toBe('serif');
  });

  it('keeps a colour the user chose, except on a template without colours', () => {
    state.setStyle({ accent: '#b91c1c' });
    state.setTemplate('executive');
    expect(state.style()!.accent).toBe('#b91c1c');
    state.setTemplate('ats');
    expect(state.style()!.accent).toBe('#111111');
    expect(state.style()!.showPhoto).toBe(false);
  });

  it('moves and hides sections', () => {
    state.moveSection('projects', -1);
    expect(state.style()!.sectionOrder.indexOf('projects')).toBe(SECTION_KEYS.indexOf('projects') - 1);
    state.toggleSection('languages');
    expect(state.style()!.hidden).toEqual(['languages']);
    state.toggleSection('languages');
    expect(state.style()!.hidden).toEqual([]);
  });

  it('saves pending edits on flush, once', async () => {
    state.edit(c => ({ ...c, summary: 'Changed' }));
    expect(state.saveState()).toBe('saved');   // the effect hasn't run yet
    TestBed.tick();
    expect(state.saveState()).toBe('dirty');
    expect(await state.flush()).toBe(true);
    expect(saves).toHaveLength(1);
    expect((saves[0] as { content: CvContent }).content.summary).toBe('Changed');
    expect(await state.flush()).toBe(true);
    expect(saves).toHaveLength(1);
  });
});

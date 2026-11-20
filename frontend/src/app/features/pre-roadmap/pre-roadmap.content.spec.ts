import { isVideoId } from '../../core/youtube';
import { FIELDS, FUNDAMENTALS, INTRO } from './pre-roadmap.content';
import { Bilingual } from './pre-roadmap.models';
import { PRE_VIDEOS } from './pre-roadmap.videos';

// Channels the site owner asked to keep out of the site (see the videos seed).
const REMOVED_CHANNELS = [
  'tutor things', 'maven analytics', 'smartherd', 'loiane groner', 'angular', 'modern software engineering', 'github',
  'microsoft visual studio', 'servicenow community', 'bridging the gap - resources for business analysts', 'jetbrains',
  'emily bache', 'platform engineering', 'fanny n.', 'techworld with nana', 'khalid essaadani',
];

function texts(value: unknown): Bilingual[] {
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record['en'] === 'string' && typeof record['ar'] === 'string') return [record as unknown as Bilingual];
    return Object.values(record).flatMap(texts);
  }
  return [];
}

describe('Pre-Roadmap content', () => {
  it('covers the eleven career fields and the seventeen fundamentals, with unique ids', () => {
    expect(FIELDS.map(f => f.id)).toEqual(['frontend', 'backend', 'fullstack', 'mobile', 'game', 'ai', 'data', 'security', 'devops', 'desktop', 'embedded']);
    expect(FUNDAMENTALS.length).toBe(17);
    expect(new Set(FUNDAMENTALS.map(f => f.id)).size).toBe(FUNDAMENTALS.length);
    expect(INTRO.length).toBeGreaterThanOrEqual(5);
  });

  it('has every text in both English and Arabic', () => {
    const all = texts([INTRO, FIELDS, FUNDAMENTALS]);
    expect(all.length).toBeGreaterThan(250);
    for (const t of all) {
      expect(t.en.trim(), JSON.stringify(t)).not.toBe('');
      expect(t.ar.trim(), JSON.stringify(t)).not.toBe('');
      expect(/[؀-ۿ]/.test(t.ar), `Arabic text expected: ${t.ar}`).toBe(true);
    }
  });

  it('gives every field what to learn first, skills, resources and videos', () => {
    for (const f of FIELDS) {
      expect(f.startWith.length, f.id).toBeGreaterThan(0);
      expect(f.skills.length, f.id).toBeGreaterThan(0);
      expect(f.technologies.length, f.id).toBeGreaterThan(3);
      expect(f.resources.length, f.id).toBeGreaterThan(0);
      expect(PRE_VIDEOS[f.id]?.length ?? 0, f.id).toBeGreaterThan(0);
    }
    for (const f of FUNDAMENTALS) {
      expect(f.resources.length, f.id).toBeGreaterThan(0);
      expect(PRE_VIDEOS[f.id]?.length ?? 0, f.id).toBeGreaterThan(0);
    }
  });

  it('only links to https resources', () => {
    for (const r of [...FIELDS, ...FUNDAMENTALS].flatMap(i => i.resources)) expect(r.url).toMatch(/^https:\/\/[^\s]+$/);
  });

  it('uses valid, unique YouTube ids, with an Arabic video for most items and no removed channel', () => {
    const all = Object.values(PRE_VIDEOS).flat();
    for (const v of all) {
      expect(isVideoId(v.videoId), v.videoId).toBe(true);
      expect(REMOVED_CHANNELS.some(c => v.channel.toLowerCase() === c || v.channel.toLowerCase().endsWith(c)), v.channel).toBe(false);
    }
    expect(new Set(all.map(v => v.videoId)).size).toBe(all.length);
    const items = Object.values(PRE_VIDEOS);
    expect(items.filter(list => list.some(v => v.language === 'Arabic')).length).toBe(items.length);
  });
});

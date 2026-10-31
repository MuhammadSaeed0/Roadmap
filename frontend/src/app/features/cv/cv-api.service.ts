import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiError } from '../../core/api-error';
import { API_BASE_URL } from '../../core/api.service';

// ---------- The CV (mirrors CvDtos.cs) ----------

export interface CvPersonal { fullName: string; title: string; email: string; phone: string; location: string; linkedIn: string; gitHub: string; website: string; }
export interface CvEducation { institution: string; degree: string; field: string; start: string; end: string; description: string; achievements: string[]; }
export interface CvExperience {
  title: string; company: string; employmentType: string; location: string; start: string; end: string; current: boolean;
  responsibilities: string[]; achievements: string[];
}
export interface CvSkillGroup { category: string; items: string[]; }
export interface CvProject { name: string; description: string; technologies: string[]; highlights: string[]; repoUrl: string; demoUrl: string; date: string; }
export interface CvCertification { name: string; issuer: string; date: string; url: string; description: string; }
export interface CvLanguage { name: string; level: string; }
export interface CvSection { kind: string; title: string; items: string[]; }
export interface CvContent {
  personal: CvPersonal; summary: string; education: CvEducation[]; experience: CvExperience[]; skills: CvSkillGroup[];
  projects: CvProject[]; certifications: CvCertification[]; languages: CvLanguage[]; sections: CvSection[];
}
export type CvSectionKey = 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certifications' | 'languages' | 'sections';
export interface CvStyle {
  accent: string; font: 'sans' | 'serif' | 'lato'; sectionOrder: CvSectionKey[]; hidden: CvSectionKey[];
  density: 'comfortable' | 'compact'; direction: 'ltr' | 'rtl'; showPhoto: boolean;
}

export interface CvTemplate {
  key: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string;
  defaultAccent: string; defaultFont: string; supportsColor: boolean; supportsPhoto: boolean; atsFriendly: boolean; defaultOrder: CvSectionKey[];
}
export interface CvSummary {
  id: number; title: string; templateKey: string; parentId: number | null; tailoredFor: string | null; hasPhoto: boolean; createdAt: string; updatedAt: string;
}
export interface Cv { summary: CvSummary; content: CvContent; style: CvStyle; }
export interface CvPreview { pageCount: number; pages: string[]; }

// ---------- Suggestions, checks, assistant ----------

export type EvidenceLevel = 'verified' | 'built' | 'practiced' | 'studied';
export interface CvEvidence { level: EvidenceLevel; detailEn: string; detailAr: string; }
export interface CvSkillSuggestion { name: string; category: string; evidence: CvEvidence; }
export interface CvProjectSuggestion {
  key: string; name: string; status: 'completed' | 'in-progress'; tasksDone: number; tasksTotal: number; technologies: string[];
  description: string; highlights: string[]; repoUrl: string; date: string; evidence: CvEvidence;
}
export interface CvCourseworkSuggestion { title: string; detail: string; evidence: CvEvidence; }
export interface CvSuggestions {
  skills: CvSkillSuggestion[]; projects: CvProjectSuggestion[]; coursework: CvCourseworkSuggestion[];
  certificationsNoteEn: string; certificationsNoteAr: string;
}
export interface CvAtsIssue { severity: 'error' | 'warning' | 'info'; section: string; code: string; messageEn: string; messageAr: string; }
export interface CvAtsReport { score: number; issues: CvAtsIssue[]; matchedKeywords: string[]; missingKeywords: string[]; }
export interface CvJobMatch {
  jobKeywords: string[]; matched: string[]; missingButLearning: string[]; missing: string[]; projectsToHighlight: string[]; suggestedOrder: CvSectionKey[];
}
export type CvAiAction = 'summary' | 'improve-text' | 'bullets' | 'project' | 'skills' | 'ats' | 'concise' | 'missing' | 'tailor';
export interface CvAiRequest { action: CvAiAction; text?: string | null; context?: string | null; jobDescription?: string | null; targetRole?: string | null; }
export interface CvAiResult {
  action: CvAiAction; text: string | null; bullets: string[]; suggestions: { section: string; suggestion: string }[];
  matching: string[]; missing: string[]; notes: string[];
}

export const SECTION_KEYS: CvSectionKey[] = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'languages', 'sections'];

/** The CV builder endpoints. Every CV is private to its owner; the server checks that on each call. */
@Injectable({ providedIn: 'root' })
export class CvApiService {
  private readonly http = inject(HttpClient);
  readonly base = inject(API_BASE_URL) + '/cv';

  templates() { return this.run(this.http.get<CvTemplate[]>(`${this.base}/templates`)); }
  thumbnailUrl(key: string) { return `${this.base}/templates/${key}/thumbnail`; }
  list() { return this.run(this.http.get<CvSummary[]>(this.base)); }
  get(id: number) { return this.run(this.http.get<Cv>(`${this.base}/${id}`)); }
  create(body: { title: string; templateKey: string; targetRole?: string | null }) { return this.run(this.http.post<Cv>(this.base, body)); }
  update(id: number, body: { title: string; templateKey: string; content: CvContent; style: CvStyle }) {
    return this.run(this.http.put<Cv>(`${this.base}/${id}`, body));
  }
  remove(id: number) { return this.run(this.http.delete<void>(`${this.base}/${id}`)); }
  duplicate(id: number, body: { title?: string | null; tailoredFor?: string | null } = {}) {
    return this.run(this.http.post<Cv>(`${this.base}/${id}/duplicate`, body));
  }
  photoUrl(id: number, version: string) { return `${this.base}/${id}/photo?v=${encodeURIComponent(version)}`; }
  setPhoto(id: number, file: File) {
    const form = new FormData();
    form.append('photo', file);
    return this.run(this.http.put<CvSummary>(`${this.base}/${id}/photo`, form));
  }
  deletePhoto(id: number) { return this.run(this.http.delete<CvSummary>(`${this.base}/${id}/photo`)); }
  preview(id: number, body: { templateKey: string; content: CvContent; style: CvStyle }) {
    return this.run(this.http.post<CvPreview>(`${this.base}/${id}/preview`, body));
  }
  /** Downloads the saved CV as a file and hands it to the browser. */
  async download(id: number, format: 'pdf' | 'docx'): Promise<void> {
    const response = await this.run(this.http.get(`${this.base}/${id}/${format}`, { observe: 'response', responseType: 'blob' }));
    const name = /filename\*=UTF-8''([^;]+)/i.exec(response.headers.get('content-disposition') ?? '')?.[1]
      ?? /filename="?([^";]+)"?/i.exec(response.headers.get('content-disposition') ?? '')?.[1] ?? `CV.${format}`;
    const url = URL.createObjectURL(response.body!);
    const link = document.createElement('a');
    link.href = url;
    link.download = decodeURIComponent(name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
  suggestions(lang: 'en' | 'ar') { return this.run(this.http.get<CvSuggestions>(`${this.base}/suggestions`, { params: { lang } })); }
  atsCheck(body: { templateKey: string; content: CvContent; style: CvStyle; jobDescription?: string | null }) {
    return this.run(this.http.post<CvAtsReport>(`${this.base}/ats-check`, body));
  }
  jobMatch(id: number, jobDescription: string) { return this.run(this.http.post<CvJobMatch>(`${this.base}/${id}/job-match`, { jobDescription })); }
  aiStatus() { return this.run(this.http.get<{ enabled: boolean; model: string | null }>(`${this.base}/ai/status`)); }
  ai(id: number, body: CvAiRequest) { return this.run(this.http.post<CvAiResult>(`${this.base}/${id}/ai`, body)); }

  private async run<T>(request: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch (e) {
      throw await blobError(e);
    }
  }
}

/** Blob downloads deliver their ProblemDetails as a Blob; read it so the error code survives. */
async function blobError(e: unknown): Promise<ApiError> {
  const body = (e as { error?: unknown })?.error;
  if (body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text()) as { code?: string; title?: string };
      return new ApiError((e as { status?: number }).status ?? -1, parsed.code ?? 'request_failed', parsed.title ?? '');
    } catch { /* not JSON */ }
  }
  return ApiError.from(e);
}

/** Empty entries for the "Add" buttons. */
export const blank = {
  experience: (): CvExperience => ({ title: '', company: '', employmentType: '', location: '', start: '', end: '', current: false, responsibilities: [], achievements: [] }),
  education: (): CvEducation => ({ institution: '', degree: '', field: '', start: '', end: '', description: '', achievements: [] }),
  project: (): CvProject => ({ name: '', description: '', technologies: [], highlights: [], repoUrl: '', demoUrl: '', date: '' }),
  skillGroup: (): CvSkillGroup => ({ category: '', items: [] }),
  certification: (): CvCertification => ({ name: '', issuer: '', date: '', url: '', description: '' }),
  language: (): CvLanguage => ({ name: '', level: '' }),
  section: (kind = 'custom'): CvSection => ({ kind, title: '', items: [] }),
};

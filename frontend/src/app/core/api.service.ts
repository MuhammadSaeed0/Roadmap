import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject, isDevMode } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiError } from './api-error';
import * as M from './models';

/** Base URL of the ASP.NET Core API. Override in app.config.ts if you change the port. */
// Development: the API runs separately on port 5080. Production: the API serves this app, so calls stay on the same origin.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => (isDevMode() ? 'http://localhost:5080/api' : '/api'),
});

type Query = Record<string, string | number | boolean | null | undefined>;

/**
 * The single place where the app talks to the backend. Components never use
 * HttpClient directly. Every method returns a Promise and throws ApiError.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  // ----- Dashboard, roadmap, topics -----
  health() { return this.get<{ status: string; database: string }>('/health'); }
  dashboard() { return this.get<M.Dashboard>('/dashboard'); }
  roadmap() { return this.get<M.Roadmap>('/roadmap'); }
  topics(query: Query) { return this.get<M.PagedResult<M.TopicSummary>>('/topics', query); }
  topic(id: number) { return this.get<M.TopicDetail>(`/topics/${id}`); }
  updateTopicProgress(id: number, body: M.TopicProgressUpdate) { return this.put<unknown>(`/topics/${id}/progress`, body); }
  recommendations(minutes?: number, take = 3) { return this.get<M.Recommendation[]>('/recommendations', { minutes, take }); }
  studyPlan(minutes: number) { return this.get<M.StudyPlan>('/study-plan', { minutes }); }

  // ----- Study sessions -----
  sessions(query: Query = {}) { return this.get<M.StudySession[]>('/study-sessions', query); }
  addSession(body: { topicId: number | null; projectTaskId: number | null; plannedMinutes: number | null; actualMinutes: number; sessionDate: string; note: string | null }) {
    return this.post<M.StudySession>('/study-sessions', body);
  }
  deleteSession(id: number) { return this.delete(`/study-sessions/${id}`); }

  // ----- Projects -----
  projects() { return this.get<M.ProjectSummary[]>('/projects'); }
  project(id: number) { return this.get<M.ProjectDetail>(`/projects/${id}`); }
  updateTask(id: number, status: M.ProjectTaskStatus, blockedReason: string | null = null) {
    return this.put<M.ProjectTask>(`/project-tasks/${id}/progress`, { status, blockedReason });
  }
  setPortfolio(projectId: number, itemId: number, isDone: boolean) {
    return this.put<M.PortfolioItem>(`/projects/${projectId}/portfolio/${itemId}`, { isDone });
  }
  setRepository(projectId: number, repositoryUrl: string | null) {
    return this.put<void>(`/projects/${projectId}/repository`, { repositoryUrl });
  }

  // ----- Resources -----
  resources(query: Query = {}) { return this.get<M.Resource[]>('/resources', query); }
  verifyResources() { return this.post<M.LinkCheckResult>('/resources/verify', {}); }

  // ----- Practice -----
  practice(query: Query = {}) { return this.get<M.PracticeOverview>('/practice', query); }
  exercise(id: number) { return this.get<M.ExerciseDetail>(`/practice/${id}`); }
  saveAttempt(id: number, answer: string) { return this.put<M.ExerciseDetail>(`/practice/${id}/attempt`, { answer }); }
  revealHint(id: number) { return this.post<M.ExerciseDetail>(`/practice/${id}/hints`, {}); }
  revealSolution(id: number) { return this.post<M.ExerciseDetail>(`/practice/${id}/solution`, {}); }
  setExerciseStatus(id: number, status: M.PracticeStatus) { return this.put<M.ExerciseDetail>(`/practice/${id}/status`, { status }); }
  saveExerciseFiles(id: number, files: M.WorkspaceFile[]) { return this.put<M.ExerciseDetail>(`/practice/${id}/files`, { files }); }
  submitExercise(id: number, files: M.WorkspaceFile[], passed: number, total: number) {
    return this.post<M.ExerciseDetail>(`/practice/${id}/submissions`, { files, passed, total });
  }
  saveExerciseCriteria(id: number, checked: number[]) { return this.put<M.ExerciseDetail>(`/practice/${id}/criteria`, { checked }); }

  // ----- Code Playground -----
  playgroundProjects() { return this.get<M.PlaygroundProjectSummary[]>('/playground/projects'); }
  playgroundProject(id: number) { return this.get<M.PlaygroundProject>(`/playground/projects/${id}`); }
  createPlaygroundProject(body: { name: string; kind: M.WorkspaceKind; template: string | null; files: M.WorkspaceFile[] }) {
    return this.post<M.PlaygroundProject>('/playground/projects', body);
  }
  updatePlaygroundProject(id: number, body: { name?: string; files?: M.WorkspaceFile[] }) {
    return this.put<M.PlaygroundProject>(`/playground/projects/${id}`, body);
  }
  deletePlaygroundProject(id: number) { return this.delete(`/playground/projects/${id}`); }

  // ----- Interviews -----
  interviews(query: Query = {}) { return this.get<M.InterviewList>('/interviews', query); }
  rateQuestion(id: number, rating: M.InterviewRating) { return this.put<M.InterviewQuestion>(`/interviews/${id}/progress`, { rating }); }

  // ----- Notes -----
  notes(query: Query = {}) { return this.get<M.Note[]>('/notes', query); }
  note(id: number) { return this.get<M.Note>(`/notes/${id}`); }
  createNote(body: M.NoteRequest) { return this.post<M.Note>('/notes', body); }
  updateNote(id: number, body: M.NoteRequest) { return this.put<M.Note>(`/notes/${id}`, body); }
  deleteNote(id: number) { return this.delete(`/notes/${id}`); }

  // ----- Reviews -----
  reviews() { return this.get<M.ReviewQueue>('/reviews'); }
  addReview(topicId: number) { return this.put<M.ReviewState>(`/reviews/${topicId}`, {}); }
  completeReview(topicId: number, confidence: number) { return this.post<M.ReviewState>(`/reviews/${topicId}/complete`, { confidence }); }
  removeReview(topicId: number) { return this.delete(`/reviews/${topicId}`); }

  // ----- Insights -----
  progress() { return this.get<M.ProgressReport>('/progress'); }
  weekly(weekOf?: string) { return this.get<M.WeeklyReview>('/progress/weekly', { weekOf }); }
  careerReadiness() { return this.get<M.CareerReadiness>('/career-readiness'); }
  search(q: string) { return this.get<M.SearchResult>('/search', { q }); }
  preferences() { return this.get<M.Preferences>('/preferences'); }
  savePreferences(body: M.Preferences) { return this.put<M.Preferences>('/preferences', body); }

  // ----- Topic videos -----
  topicVideos(topicId: number) { return this.get<M.TopicVideos>(`/topics/${topicId}/videos`); }
  videoLibrary(language: M.VideoLanguage | null = null) { return this.get<M.VideoLibrary>(`/videos/library`, { language }); }
  savedVideos() { return this.get<M.SavedVideo[]>(`/videos/saved`); }
  /** The API checks the link with YouTube before saving it. */
  addTopicVideo(topicId: number, url: string) { return this.post<M.TopicVideo>(`/topics/${topicId}/videos`, { url }); }
  removeTopicVideo(id: number) { return this.delete(`/topic-videos/${id}`); }
  taskVideos(taskId: number) { return this.get<M.TopicVideos>(`/project-tasks/${taskId}/videos`); }

  // ----- Topic quizzes -----
  /** Questions come without their answers; the API grades the submission. */
  quiz(topicId: number, level: M.QuizLevel) { return this.get<M.Quiz>(`/topics/${topicId}/quiz`, { level }); }
  submitQuiz(topicId: number, level: M.QuizLevel, answers: { questionId: number; choice: number }[]) {
    return this.post<M.QuizResult>(`/topics/${topicId}/quiz`, { level, answers });
  }
  setVideoProgress(topicId: number, videoId: string, flags: { isWatched: boolean; isBookmarked: boolean }) {
    return this.put<void>(`/videos/${encodeURIComponent(videoId)}/progress`, { topicId, ...flags });
  }

  // ----- plumbing -----
  private get<T>(path: string, query: Query = {}): Promise<T> {
    return this.run(this.http.get<T>(this.base + path, { params: toParams(query) }));
  }
  private post<T>(path: string, body: unknown): Promise<T> {
    return this.run(this.http.post<T>(this.base + path, body));
  }
  private put<T>(path: string, body: unknown): Promise<T> {
    return this.run(this.http.put<T>(this.base + path, body));
  }
  private delete(path: string): Promise<void> {
    return this.run(this.http.delete<void>(this.base + path));
  }

  private async run<T>(request: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}

function toParams(query: Query): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
  }
  return params;
}

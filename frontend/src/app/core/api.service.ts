import { Injectable, inject } from '@angular/core';
import { ApiError } from './api-error';
import * as L from './learning';
import * as M from './models';
import { SupabaseService } from './supabase.service';

type Query = Record<string, string | number | boolean | null | undefined>;

// Rows as they are stored in Postgres (snake_case). Only the columns the app reads are listed.
interface TopicRow {
  id: number; slug: string; phase_id: number; sort_order: number; skill: M.SkillArea; priority: M.TopicPriority;
  estimated_minutes: number; title_en: string; title_ar: string; summary_en: string; summary_ar: string;
  why_en: string; why_ar: string; how_en: string; how_ar: string; example_en: string; example_ar: string;
  code_sample: string | null; code_language: string | null;
  practice_task_en: string; practice_task_ar: string; challenge_en: string; challenge_ar: string;
}
interface ResourceRow {
  id: number; key: string; title_en: string; title_ar: string | null; url: string; source_name: string;
  type: M.ResourceType; difficulty: M.Difficulty; is_free: boolean; verification_status: M.VerificationStatus;
  last_verified_at: string | null; last_status_code: number | null;
}
interface ExerciseRow {
  id: number; key: string; type: M.ExerciseType; topic_id: number; difficulty: M.Difficulty; estimated_minutes: number;
  title_en: string; title_ar: string; problem_en: string; problem_ar: string; code: string | null; code_language: string | null;
  expected_outcome_en: string; expected_outcome_ar: string; hints_en: string; hints_ar: string;
  solution_en: string; solution_ar: string; solution_code: string | null;
}
interface QuestionRow {
  id: number; key: string; category: M.InterviewCategory; topic_id: number; difficulty: M.Difficulty;
  question_en: string; question_ar: string; answer_en: string; answer_ar: string;
  example_code: string | null; follow_up_en: string | null; follow_up_ar: string | null;
}
interface ChecklistRow { id: number; key: string; sort_order: number; title_en: string; title_ar: string; description_en: string; description_ar: string; }
interface TopicProgressRow { topic_id: number; status: M.TopicStatus; knowledge: M.KnowledgeLevel; confidence: number | null; started_at: string | null; completed_at: string | null; updated_at: string; }
interface ReviewRow { topic_id: number; interval_days: number; next_review_on: string; last_reviewed_on: string | null; review_count: number; created_at: string; }
interface SessionRow { id: number; topic_id: number | null; project_task_id: number | null; planned_minutes: number | null; actual_minutes: number; session_date: string; note: string | null; created_at: string; }
interface NoteRow { id: number; title: string; content: string; topic_id: number | null; project_id: number | null; project_task_id: number | null; interview_question_id: number | null; created_at: string; updated_at: string; }
interface TaskProgressRow { project_task_id: number; status: M.ProjectTaskStatus; blocked_reason: string | null; started_at: string | null; completed_at: string | null; updated_at: string; }
interface PortfolioCheckRow { project_id: number; checklist_item_id: number; is_done: boolean; updated_at: string; }
interface PracticeProgressRow { exercise_id: number; status: M.PracticeStatus; user_answer: string | null; hints_revealed: number; solution_revealed: boolean; completed_at: string | null; updated_at: string; }
interface InterviewProgressRow { question_id: number; rating: M.InterviewRating; times_practiced: number; last_practiced_at: string; }
interface PreferenceRow { daily_goal_minutes: number; allow_skipping_prerequisites: boolean; focus_skill: M.SkillArea | null; week_starts_on: M.DayOfWeek; }

/** Static roadmap content. Loaded once per session because it never changes at runtime. */
interface Content {
  phases: L.PhaseRow[];
  topics: TopicRow[];
  topicById: Map<number, TopicRow>;
  prereqs: { topic_id: number; prerequisite_topic_id: number }[];
  resources: ResourceRow[];
  resourceTopics: { resource_id: number; topic_id: number }[];
  projects: L.ProjectRow[];
  projectById: Map<number, L.ProjectRow>;
  milestones: L.MilestoneRow[];
  tasks: L.TaskRow[];
  taskById: Map<number, L.TaskRow>;
  taskTopics: { project_task_id: number; topic_id: number }[];
  checklist: ChecklistRow[];
  exercises: ExerciseRow[];
  questions: QuestionRow[];
}

/** Everything the rules need for one request: content plus the signed-in user's rows. */
interface Snapshot {
  c: Content;
  state: L.LearningState;
  progress: Map<number, TopicProgressRow>;
  reviews: Map<number, ReviewRow>;
  taskProgress: Map<number, TaskProgressRow>;
  portfolio: PortfolioCheckRow[];
  practice: Map<number, PracticeProgressRow>;
  interviews: Map<number, InterviewProgressRow>;
  sessions: SessionRow[];
  notes: NoteRow[];
  prefs: M.Preferences;
  repos: Map<number, string>;
  projects: L.ProjectView[];
  today: string;
}

const PAGE_SIZE = 1000;

/**
 * The single place where the app reads and writes data. Components never call
 * Supabase directly. Method names and return types match what the pages expect.
 * Row-level security in Postgres enforces who can read and write what.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly supabase = inject(SupabaseService);
  private contentCache: Promise<Content> | null = null;

  private get db() { return this.supabase.client; }

  // ----- Dashboard, roadmap, topics -----

  /** Reachability check for the "offline" banner. */
  async health(): Promise<{ status: string; database: string }> {
    const { error } = await this.db.from('phases').select('id').limit(1);
    if (error) throw toApiError(error);
    return { status: 'ok', database: 'connected' };
  }

  async dashboard(): Promise<M.Dashboard> {
    const s = await this.snapshot();
    const ranked = this.rank(s);
    const sessionsByDay = new Map<string, number>();
    for (const row of s.sessions) sessionsByDay.set(row.session_date, (sessionsByDay.get(row.session_date) ?? 0) + row.actual_minutes);
    const weekStart = L.weekStart(s.today, s.prefs.weekStartsOn);
    const minutesThisWeek = [...sessionsByDay].filter(([d]) => d >= weekStart && d <= s.today).reduce((sum, [, m]) => sum + m, 0);

    return {
      overall: L.overallProgress(s.state),
      recommendation: ranked[0] ? this.recommendationDto(s, ranked[0]) : null,
      projects: this.projectSummaries(s),
      skills: L.bySkill(s.state),
      recentActivity: this.recentActivity(s),
      reviewsDue: this.dueReviews(s).length,
      minutesThisWeek,
      streakDays: L.streak(new Set(sessionsByDay.keys()), s.today),
      dailyGoalMinutes: s.prefs.dailyGoalMinutes,
      minutesToday: sessionsByDay.get(s.today) ?? 0,
    };
  }

  async roadmap(): Promise<M.Roadmap> {
    const s = await this.snapshot();
    const summaries = this.projectSummaries(s);
    const lastPhaseId = s.state.phases[s.state.phases.length - 1]?.id;
    const phases: M.Phase[] = s.state.phases.map((p) => {
      const topics = s.state.topics.filter((t) => t.phaseId === p.id);
      const phaseProjects = p.id === lastPhaseId && topics.length === 0
        ? summaries.map((x) => ({ id: x.id, slug: x.slug, titleEn: x.titleEn, titleAr: x.titleAr, techStack: x.techStack, percent: x.percent }))
        : [];
      const row = s.c.phases.find((ph) => ph.id === p.id)!;
      return {
        id: p.id, slug: p.slug, order: p.sort_order, titleEn: p.title_en, titleAr: p.title_ar,
        descriptionEn: row.description_en, descriptionAr: row.description_ar,
        topicCount: topics.length, doneCount: topics.filter((t) => t.isDone).length,
        percent: topics.length > 0
          ? L.weightedPercent(topics)
          : summaries.length === 0 ? 0 : L.round1(summaries.reduce((sum, x) => sum + x.percent, 0) / summaries.length),
        remainingMinutes: topics.filter((t) => !t.isDone).reduce((sum, t) => sum + t.minutes, 0),
        topics: topics.map((t) => this.topicSummary(s, t)),
        projects: phaseProjects,
      };
    });
    return { phases, currentPhaseId: L.currentPhase(s.state)?.id ?? null };
  }

  async topics(query: Query): Promise<M.PagedResult<M.TopicSummary>> {
    const s = await this.snapshot();
    const q = qStr(query['q'])?.toLowerCase() ?? null;
    const skill = qStr(query['skill']);
    const phaseId = qNum(query['phaseId']);
    const priority = qStr(query['priority']);
    const status = qStr(query['status']);
    const knowledge = qStr(query['knowledge']);
    const page = Math.max(1, qNum(query['page']) ?? 1);
    const size = Math.min(100, Math.max(1, qNum(query['pageSize']) ?? 20));

    const filtered = s.state.topics.filter((t) => {
      const row = s.c.topicById.get(t.id)!;
      if (q && ![t.titleEn, t.titleAr, row.summary_en, row.summary_ar].some((x) => x.toLowerCase().includes(q))) return false;
      if (skill && t.skill !== skill) return false;
      if (phaseId !== null && t.phaseId !== phaseId) return false;
      if (priority && t.priority !== priority) return false;
      if (status && t.status !== status) return false;
      if (knowledge && t.knowledge !== knowledge) return false;
      return true;
    });
    const items = filtered.slice((page - 1) * size, page * size).map((t) => this.topicSummary(s, t));
    return { items, page, pageSize: size, totalCount: filtered.length, totalPages: Math.ceil(filtered.length / size) };
  }

  async topic(id: number): Promise<M.TopicDetail> {
    const s = await this.snapshot();
    const row = s.c.topicById.get(id);
    const me = s.state.byId.get(id);
    if (!row || !me) throw notFound('Topic');
    const phase = s.c.phases.find((p) => p.id === row.phase_id)!;
    const ref = (tid: number) => L.topicRef(s.state.byId.get(tid)!);
    const review = s.reviews.get(id);
    const sessions = s.sessions.filter((x) => x.topic_id === id)
      .sort((a, b) => b.session_date.localeCompare(a.session_date) || b.id - a.id);
    const questions = s.c.questions.filter((q) => q.topic_id === id)
      .map((q) => ({ q, rating: s.interviews.get(q.id)?.rating ?? null }))
      .sort((a, b) => L.difficultyRank(a.q.difficulty) - L.difficultyRank(b.q.difficulty) || a.q.id - b.q.id);
    const exercises = s.c.exercises.filter((e) => e.topic_id === id)
      .map((e) => ({ e, status: s.practice.get(e.id)?.status ?? 'NotStarted' as M.PracticeStatus }))
      .sort((a, b) => L.exerciseTypeRank(a.e.type) - L.exerciseTypeRank(b.e.type) || a.e.id - b.e.id);

    const projectLinks = new Map<number, { project: L.ProjectRow; count: number }>();
    for (const link of s.c.taskTopics.filter((l) => l.topic_id === id)) {
      const project = this.projectOfTask(s.c, link.project_task_id);
      if (!project) continue;
      const entry = projectLinks.get(project.id) ?? { project, count: 0 };
      entry.count++;
      projectLinks.set(project.id, entry);
    }

    const resources = this.resourcesFor(s, (r) => s.c.resourceTopics.some((l) => l.resource_id === r.id && l.topic_id === id));

    return {
      id: row.id, slug: row.slug, phase: L.phaseRef(phase), order: row.sort_order, skill: row.skill,
      priority: row.priority, estimatedMinutes: row.estimated_minutes,
      titleEn: row.title_en, titleAr: row.title_ar, summaryEn: row.summary_en, summaryAr: row.summary_ar,
      whyEn: row.why_en, whyAr: row.why_ar, howEn: row.how_en, howAr: row.how_ar,
      exampleEn: row.example_en, exampleAr: row.example_ar, codeSample: row.code_sample, codeLanguage: row.code_language,
      practiceTaskEn: row.practice_task_en, practiceTaskAr: row.practice_task_ar,
      challengeEn: row.challenge_en, challengeAr: row.challenge_ar,
      status: me.status, knowledge: me.knowledge, confidence: me.confidence, completedAt: me.completedAt,
      prerequisitesMet: L.prerequisitesMet(s.state, me),
      prerequisites: me.prereqIds.map(ref),
      unlocks: (s.state.dependents.get(id) ?? []).map(ref),
      samePhase: s.state.topics.filter((t) => t.phaseId === me.phaseId && t.id !== id).map(L.topicRef),
      resources,
      projects: [...projectLinks.values()]
        .sort((a, b) => a.project.sort_order - b.project.sort_order)
        .map(({ project, count }) => ({ projectId: project.id, slug: project.slug, titleEn: project.title_en, titleAr: project.title_ar, taskCount: count })),
      interviewQuestions: questions.map(({ q, rating }) => ({ id: q.id, questionEn: q.question_en, questionAr: q.question_ar, difficulty: q.difficulty, rating })),
      exercises: exercises.map(({ e, status }) => ({ id: e.id, type: e.type, titleEn: e.title_en, titleAr: e.title_ar, difficulty: e.difficulty, status })),
      sessions: sessions.slice(0, 10).map((x) => this.sessionDto(s.c, x)),
      totalMinutesStudied: sessions.reduce((sum, x) => sum + x.actual_minutes, 0),
      noteCount: s.notes.filter((n) => n.topic_id === id).length,
      review: review ? this.reviewState(review, s.today) : null,
    };
  }

  async updateTopicProgress(id: number, body: M.TopicProgressUpdate): Promise<unknown> {
    const s = await this.snapshot();
    if (!s.c.topicById.has(id)) throw notFound('Topic');
    if (!isOneOf(body.status, STATUSES) || !isOneOf(body.knowledge, KNOWLEDGE)) throw invalid('status', 'required', 'Status and knowledge are required.');
    if (body.confidence !== null && (body.confidence < 0 || body.confidence > 5)) throw invalid('confidence', 'range', 'Confidence must be between 0 and 5.');

    const existing = s.progress.get(id);
    const now = new Date().toISOString();
    let startedAt = existing?.started_at ?? null;
    let completedAt = existing?.completed_at ?? null;
    switch (body.status) {
      case 'NotStarted': startedAt = null; completedAt = null; break;
      case 'InProgress': startedAt ??= now; completedAt = null; break;
      default: startedAt ??= now; completedAt ??= now; break;
    }
    const row = {
      user_id: this.supabase.userId(), topic_id: id, status: body.status, knowledge: body.knowledge,
      confidence: body.confidence, started_at: startedAt, completed_at: completedAt, updated_at: now,
    };
    await this.write(this.db.from('topic_progress').upsert(row, { onConflict: 'user_id,topic_id' }));
    return { topicId: id, status: body.status, knowledge: body.knowledge, confidence: body.confidence, startedAt, completedAt, updatedAt: now };
  }

  async recommendations(minutes?: number, take = 3): Promise<M.Recommendation[]> {
    const s = await this.snapshot();
    const ranked = this.rank(s, minutes ?? null);
    return ranked.slice(0, Math.min(10, Math.max(1, take))).map((r) => this.recommendationDto(s, r));
  }

  async studyPlan(minutes: number): Promise<M.StudyPlan> {
    const s = await this.snapshot();
    const ranked = this.rank(s);
    const topic = ranked[0]?.topic ?? null;
    const items: M.StudyPlanItem[] = [];
    for (const { kind, minutes: m } of L.planDurations(minutes)) {
      const item = this.planItem(s, kind, m, topic, ranked);
      if (item) items.push(item);
    }
    return { minutes, items: L.mergeConsecutive(items) };
  }

  // ----- Study sessions -----

  async sessions(query: Query = {}): Promise<M.StudySession[]> {
    const s = await this.snapshot();
    const from = qStr(query['from']);
    const to = qStr(query['to']);
    const topicId = qNum(query['topicId']);
    return s.sessions
      .filter((x) => (!from || x.session_date >= from) && (!to || x.session_date <= to) && (topicId === null || x.topic_id === topicId))
      .sort((a, b) => b.session_date.localeCompare(a.session_date) || b.id - a.id)
      .slice(0, 500)
      .map((x) => this.sessionDto(s.c, x));
  }

  async addSession(body: { topicId: number | null; projectTaskId: number | null; plannedMinutes: number | null; actualMinutes: number; sessionDate: string; note: string | null }): Promise<M.StudySession> {
    const s = await this.snapshot();
    if (body.topicId !== null && !s.c.topicById.has(body.topicId)) throw invalid('topicId', 'notFound', 'Topic does not exist.');
    if (body.projectTaskId !== null && !s.c.taskById.has(body.projectTaskId)) throw invalid('projectTaskId', 'notFound', 'Project task does not exist.');
    if (!Number.isInteger(body.actualMinutes) || body.actualMinutes < 1 || body.actualMinutes > 1440) throw invalid('actualMinutes', 'range', 'Minutes must be between 1 and 1440.');
    if (body.plannedMinutes !== null && (body.plannedMinutes < 1 || body.plannedMinutes > 1440)) throw invalid('plannedMinutes', 'range', 'Planned minutes must be between 1 and 1440.');
    if (!body.sessionDate) throw invalid('sessionDate', 'required', 'A date is required.');
    if (body.sessionDate > s.today) throw invalid('sessionDate', 'futureDate', "A study session can't be in the future.");
    const note = body.note?.trim() || null;
    if (note && note.length > 1000) throw invalid('note', 'maxLength', 'Notes can be at most 1000 characters.');

    const now = new Date().toISOString();
    const userId = this.supabase.userId();
    const { data, error } = await this.db.from('study_sessions').insert({
      user_id: userId, topic_id: body.topicId, project_task_id: body.projectTaskId, planned_minutes: body.plannedMinutes,
      actual_minutes: body.actualMinutes, session_date: body.sessionDate, note, created_at: now,
    }).select().single();
    if (error) throw toApiError(error);

    // Logging a session on a topic you haven't started moves it to "In progress".
    if (body.topicId !== null) {
      const existing = s.progress.get(body.topicId);
      if (!existing) {
        await this.write(this.db.from('topic_progress').upsert({
          user_id: userId, topic_id: body.topicId, status: 'InProgress', knowledge: 'Unassessed', confidence: null,
          started_at: now, completed_at: null, updated_at: now,
        }, { onConflict: 'user_id,topic_id' }));
      } else if (existing.status === 'NotStarted') {
        await this.write(this.db.from('topic_progress').upsert({
          ...existing, user_id: userId, status: 'InProgress', started_at: existing.started_at ?? now, updated_at: now,
        }, { onConflict: 'user_id,topic_id' }));
      }
    }
    return this.sessionDto(s.c, data as SessionRow);
  }

  async deleteSession(id: number): Promise<void> {
    const { data, error } = await this.db.from('study_sessions').delete().eq('id', id).select('id');
    if (error) throw toApiError(error);
    if (!data || data.length === 0) throw notFound('StudySession');
  }

  // ----- Projects -----

  async projects(): Promise<M.ProjectSummary[]> {
    return this.projectSummaries(await this.snapshot());
  }

  async project(id: number): Promise<M.ProjectDetail> {
    const s = await this.snapshot();
    const pv = s.projects.find((p) => p.row.id === id);
    if (!pv) throw notFound('Project');
    const phases = s.c.phases;
    const checklist = s.c.checklist;
    const calc = L.summarizeProject(pv, phases, checklist.length);
    const summary = calc.summary;
    const topicsById = s.state.byId;
    const toTask = (t: L.ProjectView['milestones'][number]['tasks'][number]) => L.toProjectTask(t, calc.percent, topicsById);

    const milestones: M.Milestone[] = pv.milestones.map((m) => {
      const tasks = m.tasks.filter((t) => !t.row.is_change_request).map(toTask);
      return {
        id: m.row.id, order: m.row.sort_order, titleEn: m.row.title_en, titleAr: m.row.title_ar,
        descriptionEn: m.row.description_en, descriptionAr: m.row.description_ar,
        totalTasks: tasks.length, completedTasks: tasks.filter((t) => t.status === 'Completed').length, tasks,
      };
    }).filter((m) => m.totalTasks > 0);

    const changeRequests = calc.allTasks.filter((t) => t.row.is_change_request)
      .sort((a, b) => a.row.unlock_at_percent - b.row.unlock_at_percent || a.row.sort_order - b.row.sort_order)
      .map(toTask);

    const noteCount = s.notes.filter((n) => n.project_id === id || (n.project_task_id !== null && this.projectOfTask(s.c, n.project_task_id)?.id === id)).length;

    return {
      summary,
      requirementsEn: L.splitLines(pv.row.requirements_en),
      requirementsAr: L.splitLines(pv.row.requirements_ar),
      repositoryUrl: pv.repositoryUrl,
      milestones,
      changeRequests,
      portfolio: checklist.map((i) => ({
        id: i.id, key: i.key, titleEn: i.title_en, titleAr: i.title_ar, descriptionEn: i.description_en,
        descriptionAr: i.description_ar, isDone: pv.portfolioDone.has(i.id),
      })),
      noteCount,
    };
  }

  async updateTask(id: number, status: M.ProjectTaskStatus, blockedReason: string | null = null): Promise<M.ProjectTask> {
    const s = await this.snapshot();
    const found = s.projects.map((p) => ({ p, t: p.milestones.flatMap((m) => m.tasks).find((x) => x.row.id === id) }))
      .find((x) => x.t !== undefined);
    if (!found?.t) throw notFound('ProjectTask');
    const percent = L.summarizeProject(found.p, s.c.phases, 0).percent;
    if (found.t.row.is_change_request && status !== 'NotStarted' && percent < found.t.row.unlock_at_percent) {
      throw conflict('task_locked', `This change request unlocks when the project reaches ${found.t.row.unlock_at_percent}%.`);
    }
    const reason = blockedReason?.trim() || null;
    if (status === 'Blocked' && !reason) throw invalid('blockedReason', 'required', 'Please describe what is blocking this task.');

    const existing = s.taskProgress.get(id);
    const now = new Date().toISOString();
    const startedAt = status === 'InProgress' || status === 'Completed' ? (existing?.started_at ?? now)
      : status === 'NotStarted' ? null : (existing?.started_at ?? null);
    const completedAt = status === 'Completed' ? (existing?.completed_at ?? now) : null;
    await this.write(this.db.from('project_task_progress').upsert({
      user_id: this.supabase.userId(), project_task_id: id, status,
      blocked_reason: status === 'Blocked' ? reason : null, started_at: startedAt, completed_at: completedAt, updated_at: now,
    }, { onConflict: 'user_id,project_task_id' }));

    const fresh = await this.snapshot();
    const fp = fresh.projects.find((p) => p.milestones.some((m) => m.tasks.some((t) => t.row.id === id)))!;
    const ft = fp.milestones.flatMap((m) => m.tasks).find((t) => t.row.id === id)!;
    return L.toProjectTask(ft, L.summarizeProject(fp, fresh.c.phases, 0).percent, fresh.state.byId);
  }

  async setPortfolio(projectId: number, itemId: number, isDone: boolean): Promise<M.PortfolioItem> {
    const s = await this.snapshot();
    if (!s.c.projectById.has(projectId)) throw notFound('Project');
    const item = s.c.checklist.find((i) => i.id === itemId);
    if (!item) throw notFound('PortfolioChecklistItem');
    await this.write(this.db.from('portfolio_checks').upsert({
      user_id: this.supabase.userId(), project_id: projectId, checklist_item_id: itemId, is_done: isDone, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,project_id,checklist_item_id' }));
    return {
      id: item.id, key: item.key, titleEn: item.title_en, titleAr: item.title_ar,
      descriptionEn: item.description_en, descriptionAr: item.description_ar, isDone,
    };
  }

  async setRepository(projectId: number, repositoryUrl: string | null): Promise<void> {
    const s = await this.snapshot();
    if (!s.c.projectById.has(projectId)) throw notFound('Project');
    const url = repositoryUrl?.trim() || null;
    if (url && (url.length > 500 || !/^https?:\/\//i.test(url))) throw invalid('repositoryUrl', 'url', 'Enter a valid URL starting with http:// or https://.');
    await this.write(this.db.from('project_repositories').upsert({
      user_id: this.supabase.userId(), project_id: projectId, repository_url: url, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,project_id' }));
  }

  // ----- Resources -----

  async resources(query: Query = {}): Promise<M.Resource[]> {
    const s = await this.snapshot();
    const topicId = qNum(query['topicId']);
    const type = qStr(query['type']);
    const skill = qStr(query['skill']);
    const q = qStr(query['q'])?.toLowerCase() ?? null;
    return this.resourcesFor(s, (r) => {
      const linked = s.c.resourceTopics.filter((l) => l.resource_id === r.id).map((l) => s.state.byId.get(l.topic_id)).filter((t): t is L.TopicState => t !== undefined);
      if (topicId !== null && !linked.some((t) => t.id === topicId)) return false;
      if (skill && !linked.some((t) => t.skill === skill)) return false;
      if (type && r.type !== type) return false;
      if (q && ![r.title_en, r.title_ar ?? '', r.source_name].some((x) => x.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  /**
   * Link checking ran on the old .NET server. The hosted site has no server, so it is
   * not available here. Run the link check locally if you need it.
   */
  async verifyResources(): Promise<M.LinkCheckResult> {
    throw new ApiError(501, 'not_available', 'Link checking is not available on the hosted site.');
  }

  // ----- Practice -----

  async practice(query: Query = {}): Promise<M.PracticeOverview> {
    const s = await this.snapshot();
    const type = qStr(query['type']);
    const topicId = qNum(query['topicId']);
    const skill = qStr(query['skill']);
    const all = this.exerciseSummaries(s);
    const stats: M.PracticeTypeStats[] = M.EXERCISE_TYPES.map((t) => ({
      type: t,
      total: all.filter((e) => e.type === t).length,
      completed: all.filter((e) => e.type === t && e.status === 'Completed').length,
      attempted: all.filter((e) => e.type === t && e.status === 'Attempted').length,
    }));
    const exercises = all.filter((e) => (!type || e.type === type) && (topicId === null || e.topicId === topicId)
      && (!skill || s.c.topicById.get(e.topicId)?.skill === skill));
    return { exercises, stats };
  }

  async exercise(id: number): Promise<M.ExerciseDetail> {
    return this.exerciseDetail(await this.snapshot(), id);
  }

  async saveAttempt(id: number, answer: string): Promise<M.ExerciseDetail> {
    const s = await this.snapshot();
    const text = answer.trim();
    if (text.length === 0) throw invalid('answer', 'required', 'Write your answer before saving.');
    if (text.length > 10000) throw invalid('answer', 'maxLength', 'Answers can be at most 10000 characters.');
    this.exerciseOrThrow(s, id);
    await this.writePractice(id, s, { user_answer: text, status: attemptedStatus(s, id) });
    return this.exerciseDetail(await this.snapshot(), id);
  }

  async revealHint(id: number): Promise<M.ExerciseDetail> {
    const s = await this.snapshot();
    const hintCount = L.splitLines(this.exerciseOrThrow(s, id).hints_en).length;
    const revealed = s.practice.get(id)?.hints_revealed ?? 0;
    if (revealed >= hintCount) throw conflict('no_more_hints', 'All hints have already been revealed.');
    await this.writePractice(id, s, { hints_revealed: revealed + 1, status: attemptedStatus(s, id) });
    return this.exerciseDetail(await this.snapshot(), id);
  }

  async revealSolution(id: number): Promise<M.ExerciseDetail> {
    const s = await this.snapshot();
    this.exerciseOrThrow(s, id);
    if (!s.practice.get(id)?.user_answer?.trim()) {
      throw conflict('attempt_required', 'Write and save your own attempt or explanation before revealing the solution.');
    }
    await this.writePractice(id, s, { solution_revealed: true });
    return this.exerciseDetail(await this.snapshot(), id);
  }

  async setExerciseStatus(id: number, status: M.PracticeStatus): Promise<M.ExerciseDetail> {
    const s = await this.snapshot();
    this.exerciseOrThrow(s, id);
    const current = s.practice.get(id);
    const now = new Date().toISOString();
    const patch: Partial<PracticeProgressRow> = { status, updated_at: now };
    if (status === 'NotStarted') {
      // Reset: start the exercise again from scratch.
      patch.user_answer = null; patch.hints_revealed = 0; patch.solution_revealed = false; patch.completed_at = null;
    } else if (status === 'Completed') {
      patch.completed_at = current?.completed_at ?? now;
    } else {
      patch.completed_at = null;
    }
    await this.writePractice(id, s, patch);
    return this.exerciseDetail(await this.snapshot(), id);
  }

  // ----- Interviews -----

  async interviews(query: Query = {}): Promise<M.InterviewList> {
    const s = await this.snapshot();
    const category = qStr(query['category']);
    const topicId = qNum(query['topicId']);
    const rating = qStr(query['rating']);
    const all = this.questionDtos(s).sort((a, b) =>
      L.interviewCategoryRank(a.category) - L.interviewCategoryRank(b.category) || L.difficultyRank(a.difficulty) - L.difficultyRank(b.difficulty) || a.id - b.id);

    const categories: M.InterviewCategoryStats[] = M.INTERVIEW_CATEGORIES.map((c) => all.filter((q) => q.category === c))
      .filter((list) => list.length > 0)
      .map((list) => ({
        category: list[0].category, total: list.length,
        confident: list.filter((q) => q.rating === 'Confident').length,
        partial: list.filter((q) => q.rating === 'Partial').length,
        needReview: list.filter((q) => q.rating === 'NeedReview').length,
      }));

    const questions = all.filter((q) =>
      (!category || q.category === category) && (topicId === null || q.topicId === topicId)
      && (!rating || (rating === 'unrated' ? q.rating === null : q.rating?.toLowerCase() === rating.toLowerCase())));
    return { questions, categories };
  }

  async rateQuestion(id: number, rating: M.InterviewRating): Promise<M.InterviewQuestion> {
    const s = await this.snapshot();
    if (!s.c.questions.some((q) => q.id === id)) throw notFound('InterviewQuestion');
    if (!isOneOf(rating, RATINGS)) throw invalid('rating', 'required', 'Choose a rating.');
    const existing = s.interviews.get(id);
    await this.write(this.db.from('interview_progress').upsert({
      user_id: this.supabase.userId(), question_id: id, rating,
      times_practiced: (existing?.times_practiced ?? 0) + 1, last_practiced_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' }));
    const fresh = await this.snapshot();
    return this.questionDtos(fresh).find((q) => q.id === id)!;
  }

  // ----- Notes -----

  async notes(query: Query = {}): Promise<M.Note[]> {
    const s = await this.snapshot();
    const q = qStr(query['q'])?.toLowerCase() ?? null;
    const topicId = qNum(query['topicId']);
    const projectId = qNum(query['projectId']);
    const projectTaskId = qNum(query['projectTaskId']);
    const questionId = qNum(query['interviewQuestionId']);
    return s.notes
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .filter((n) => topicId === null || n.topic_id === topicId)
      .filter((n) => projectId === null || n.project_id === projectId || (n.project_task_id !== null && this.projectOfTask(s.c, n.project_task_id)?.id === projectId))
      .filter((n) => projectTaskId === null || n.project_task_id === projectTaskId)
      .filter((n) => questionId === null || n.interview_question_id === questionId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 200)
      .map((n) => this.noteDto(s.c, n));
  }

  async note(id: number): Promise<M.Note> {
    const s = await this.snapshot();
    const n = s.notes.find((x) => x.id === id);
    if (!n) throw notFound('Note');
    return this.noteDto(s.c, n);
  }

  async createNote(body: M.NoteRequest): Promise<M.Note> {
    const s = await this.snapshot();
    this.validateNote(s.c, body);
    const now = new Date().toISOString();
    const { data, error } = await this.db.from('notes').insert({
      user_id: this.supabase.userId(), title: body.title.trim(), content: body.content ?? '',
      topic_id: body.topicId, project_id: body.projectId, project_task_id: body.projectTaskId,
      interview_question_id: body.interviewQuestionId, created_at: now, updated_at: now,
    }).select().single();
    if (error) throw toApiError(error);
    return this.noteDto(s.c, data as NoteRow);
  }

  async updateNote(id: number, body: M.NoteRequest): Promise<M.Note> {
    const s = await this.snapshot();
    if (!s.notes.some((n) => n.id === id)) throw notFound('Note');
    this.validateNote(s.c, body);
    const { data, error } = await this.db.from('notes').update({
      title: body.title.trim(), content: body.content ?? '', topic_id: body.topicId, project_id: body.projectId,
      project_task_id: body.projectTaskId, interview_question_id: body.interviewQuestionId, updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw toApiError(error);
    return this.noteDto(s.c, data as NoteRow);
  }

  async deleteNote(id: number): Promise<void> {
    const { data, error } = await this.db.from('notes').delete().eq('id', id).select('id');
    if (error) throw toApiError(error);
    if (!data || data.length === 0) throw notFound('Note');
  }

  // ----- Reviews -----

  async reviews(): Promise<M.ReviewQueue> {
    const s = await this.snapshot();
    const items = this.reviewItems(s);
    const due = items.filter((i) => i.nextReviewOn <= s.today);
    const upcoming = items.filter((i) => i.nextReviewOn > s.today);
    const suggested = [...s.progress.values()]
      .filter((p) => p.status === 'Completed' && p.confidence !== null && p.confidence <= 2 && !s.reviews.has(p.topic_id))
      .map((p) => s.state.byId.get(p.topic_id)!)
      .filter((t) => t !== undefined)
      .sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0) || a.phaseOrder - b.phaseOrder || a.order - b.order)
      .slice(0, 6)
      .map(L.topicRef);
    return { due, upcoming, suggested, rules: L.REVIEW_RULES };
  }

  /** Adds a topic to the review queue. Adding it twice is harmless. */
  async addReview(topicId: number): Promise<M.ReviewState> {
    const s = await this.snapshot();
    if (!s.c.topicById.has(topicId)) throw notFound('Topic');
    const existing = s.reviews.get(topicId);
    if (existing) return this.reviewState(existing, s.today);
    const interval = L.reviewIntervalDays(s.progress.get(topicId)?.confidence);
    const row: ReviewRow = {
      topic_id: topicId, interval_days: interval, next_review_on: L.addDays(s.today, interval),
      last_reviewed_on: null, review_count: 0, created_at: new Date().toISOString(),
    };
    await this.write(this.db.from('review_schedules').insert({ user_id: this.supabase.userId(), ...row }));
    return this.reviewState(row, s.today);
  }

  /** Records a finished review and reschedules it from the new confidence. */
  async completeReview(topicId: number, confidence: number): Promise<M.ReviewState> {
    const s = await this.snapshot();
    const schedule = s.reviews.get(topicId);
    if (!schedule) throw notFound('ReviewSchedule');
    if (!Number.isInteger(confidence) || confidence < 0 || confidence > 5) throw invalid('confidence', 'range', 'Confidence must be between 0 and 5.');
    const interval = L.reviewIntervalDays(confidence);
    const next: ReviewRow = {
      ...schedule, interval_days: interval, last_reviewed_on: s.today,
      next_review_on: L.addDays(s.today, interval), review_count: schedule.review_count + 1,
    };
    const now = new Date().toISOString();
    const userId = this.supabase.userId();
    await this.write(this.db.from('review_schedules').update({
      interval_days: next.interval_days, last_reviewed_on: next.last_reviewed_on, next_review_on: next.next_review_on,
      review_count: next.review_count,
    }).eq('topic_id', topicId));

    // Reviewing also updates the topic's confidence, so there is one source of truth.
    const progress = s.progress.get(topicId);
    await this.write(this.db.from('topic_progress').upsert(progress
      ? { ...progress, user_id: userId, confidence, updated_at: now }
      : { user_id: userId, topic_id: topicId, status: 'InProgress', knowledge: 'Unassessed', confidence, started_at: now, completed_at: null, updated_at: now },
    { onConflict: 'user_id,topic_id' }));
    return this.reviewState(next, s.today);
  }

  async removeReview(topicId: number): Promise<void> {
    const { data, error } = await this.db.from('review_schedules').delete().eq('topic_id', topicId).select('topic_id');
    if (error) throw toApiError(error);
    if (!data || data.length === 0) throw notFound('ReviewSchedule');
  }

  // ----- Insights -----

  async progress(): Promise<M.ProgressReport> {
    const s = await this.snapshot();
    const summaries = this.projectSummaries(s);
    const exercises = this.exerciseSummaries(s);
    const questions = this.questionDtos(s);
    const thisWeek = L.weekStart(s.today, s.prefs.weekStartsOn);
    const firstWeek = L.addDays(thisWeek, -49);
    const weeklyStudy = Array.from({ length: 8 }, (_, i) => {
      const start = L.addDays(firstWeek, 7 * i);
      const end = L.addDays(start, 7);
      return { weekStart: start, minutes: s.sessions.filter((x) => x.session_date >= start && x.session_date < end).reduce((sum, x) => sum + x.actual_minutes, 0) };
    });
    const milestones = s.c.milestones.map((m) => {
      const tasks = s.c.tasks.filter((t) => t.milestone_id === m.id).map((t) => ({
        status: s.taskProgress.get(t.id)?.status ?? 'NotStarted' as M.ProjectTaskStatus,
        completedAt: s.taskProgress.get(t.id)?.completed_at ?? null,
        isChangeRequest: t.is_change_request,
      }));
      const project = s.c.projectById.get(m.project_id)!;
      return { en: m.title_en, ar: m.title_ar, projectEn: project.title_en, projectAr: project.title_ar, tasks };
    });
    const practiceDates = [...s.practice.values()].filter((p) => p.completed_at).map((p) => p.completed_at!);
    const totalMinutes = s.sessions.reduce((sum, x) => sum + x.actual_minutes, 0);

    return {
      overall: L.overallProgress(s.state),
      formula: { skillWeights: L.SKILL_WEIGHTS, priorityWeights: L.PRIORITY_WEIGHTS },
      skills: L.bySkill(s.state),
      phases: L.byPhase(s.state),
      confidence: L.confidenceDistribution(s.state),
      projects: summaries,
      practice: M.EXERCISE_TYPES.map((t) => ({
        type: t,
        total: exercises.filter((e) => e.type === t).length,
        completed: exercises.filter((e) => e.type === t && e.status === 'Completed').length,
        attempted: exercises.filter((e) => e.type === t && e.status === 'Attempted').length,
      })),
      interview: {
        total: questions.length,
        confident: questions.filter((q) => q.rating === 'Confident').length,
        partial: questions.filter((q) => q.rating === 'Partial').length,
        needReview: questions.filter((q) => q.rating === 'NeedReview').length,
        notPracticed: questions.filter((q) => q.rating === null).length,
      },
      weeklyStudy,
      achievements: L.achievements(s.state, totalMinutes, milestones, practiceDates),
      weakAreas: L.weakAreas(s.state),
      totalMinutesStudied: totalMinutes,
    };
  }

  async weekly(weekOf?: string): Promise<M.WeeklyReview> {
    const s = await this.snapshot();
    const start = L.weekStart(weekOf || s.today, s.prefs.weekStartsOn);
    const end = L.addDays(start, 6);
    const fromIso = L.localMidnightIso(start);
    const toIso = L.localMidnightIso(L.addDays(end, 1));
    const inRange = (iso: string | null) => iso !== null && iso >= fromIso && iso < toIso;

    const window = s.sessions.filter((x) => x.session_date >= L.addDays(start, -7) && x.session_date <= end);
    const thisWeekSessions = window.filter((x) => x.session_date >= start);
    const minutes = thisWeekSessions.reduce((sum, x) => sum + x.actual_minutes, 0);

    const topicsCompleted = [...s.progress.values()].filter((p) => inRange(p.completed_at))
      .sort((a, b) => (a.completed_at! < b.completed_at! ? -1 : 1))
      .map((p) => L.topicRef(s.state.byId.get(p.topic_id)!));
    const tasksCompleted = [...s.taskProgress.values()].filter((p) => inRange(p.completed_at)).map((p) => {
      const task = s.c.taskById.get(p.project_task_id)!;
      const project = this.projectOfTask(s.c, p.project_task_id)!;
      return { id: task.id, projectId: project.id, titleEn: task.title_en, titleAr: task.title_ar, projectTitleEn: project.title_en, projectTitleAr: project.title_ar };
    });
    const exercisesCompleted = [...s.practice.values()].filter((p) => inRange(p.completed_at)).length;
    const questionsPracticed = [...s.interviews.values()].filter((p) => inRange(p.last_practiced_at)).length;

    const weak = L.weakAreas(s.state, 6);
    const suggestions: M.Reason[] = [];
    const goal = s.prefs.dailyGoalMinutes * 5;
    if (minutes < goal) suggestions.push({ code: 'studyMore', params: { goal: String(goal), minutes: String(minutes) } });
    const due = this.dueReviews(s).length;
    if (due > 0) suggestions.push({ code: 'clearReviews', params: { count: String(due) } });
    if (weak.length > 0) suggestions.push({ code: 'reviewWeak', params: { count: String(weak.length) } });
    const blocked = this.projectSummaries(s).reduce((sum, p) => sum + p.blockedTasks, 0);
    if (blocked > 0) suggestions.push({ code: 'unblockTasks', params: { count: String(blocked) } });
    const next = this.rank(s)[0];
    if (next) suggestions.push({ code: 'nextTopic', params: { en: next.topic.titleEn, ar: next.topic.titleAr, topicId: String(next.topic.id) } });
    const nextTask = L.nextProjectTask(s.projects, s.c.phases);
    if (nextTask) suggestions.push({ code: 'projectTask', params: { en: nextTask.task.row.title_en, ar: nextTask.task.row.title_ar, projectId: String(nextTask.project.row.id) } });
    const needReview = [...s.interviews.values()].filter((p) => p.rating === 'NeedReview').length;
    if (needReview > 0) suggestions.push({ code: 'interviewReview', params: { count: String(needReview) } });

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = L.addDays(start, i);
      return { date, minutes: thisWeekSessions.filter((x) => x.session_date === date).reduce((sum, x) => sum + x.actual_minutes, 0) };
    });

    return {
      weekStart: start, weekEnd: end, topicsCompleted, minutesStudied: minutes,
      previousWeekMinutes: window.filter((x) => x.session_date < start).reduce((sum, x) => sum + x.actual_minutes, 0),
      sessionCount: thisWeekSessions.length, tasksCompleted, exercisesCompleted, questionsPracticed,
      weakTopics: weak, suggestions: suggestions.slice(0, 6), days,
    };
  }

  async careerReadiness(): Promise<M.CareerReadiness> {
    const s = await this.snapshot();
    const allTasks = s.c.tasks.map((t) => ({
      projectTaskId: t.id,
      isChangeRequest: t.is_change_request,
      linkedTopicIds: s.c.taskTopics.filter((l) => l.project_task_id === t.id).map((l) => l.topic_id),
      done: s.taskProgress.get(t.id)?.status === 'Completed',
    }));
    return L.careerReadiness({
      state: s.state,
      summaries: this.projectSummaries(s),
      allProjectTasks: allTasks,
      exercises: this.exerciseSummaries(s).map((e) => ({ type: e.type, done: e.status === 'Completed' })),
      ratings: s.c.questions.map((q) => s.interviews.get(q.id)?.rating ?? null),
      checklist: s.c.checklist.map((i) => ({ id: i.id, key: i.key, titleEn: i.title_en, titleAr: i.title_ar, descriptionEn: i.description_en, descriptionAr: i.description_ar })),
      portfolioChecks: s.portfolio.filter((c) => c.is_done).map((c) => ({ projectId: c.project_id, checklistItemId: c.checklist_item_id })),
    });
  }

  async search(q: string): Promise<M.SearchResult> {
    const s = await this.snapshot();
    const term = q.trim().toLowerCase();
    const has = (...fields: string[]) => fields.some((f) => f.toLowerCase().includes(term));
    const groups: M.SearchResult['groups'] = [];
    const add = (category: M.SearchCategory, items: M.SearchHit[]) => { if (items.length > 0) groups.push({ category, items }); };
    const take = <T>(list: T[]) => list.slice(0, 6);

    add('topics', take(s.state.topics.filter((t) => {
      const r = s.c.topicById.get(t.id)!;
      return has(t.titleEn, t.titleAr, r.summary_en, r.summary_ar);
    }).sort((a, b) => Number(!has(a.titleEn, a.titleAr)) - Number(!has(b.titleEn, b.titleAr)) || a.phaseOrder - b.phaseOrder || a.order - b.order))
      .map((t) => ({ id: t.id, titleEn: t.titleEn, titleAr: t.titleAr, subtitleEn: phaseTitle(s, t.phaseId, 'en'), subtitleAr: phaseTitle(s, t.phaseId, 'ar'), parentId: null, url: null })));

    add('projects', take(s.c.projects.filter((p) => has(p.title_en, p.title_ar, p.summary_en, p.summary_ar, p.tech_stack))
      .map((p) => ({ id: p.id, titleEn: p.title_en, titleAr: p.title_ar, subtitleEn: p.tech_stack, subtitleAr: p.tech_stack, parentId: null, url: null }))));

    add('tasks', take(s.c.tasks.filter((t) => has(t.title_en, t.title_ar, t.description_en, t.description_ar))
      .map((t) => {
        const project = this.projectOfTask(s.c, t.id)!;
        return { id: t.id, titleEn: t.title_en, titleAr: t.title_ar, subtitleEn: project.title_en, subtitleAr: project.title_ar, parentId: project.id, url: null };
      })));

    add('practice', take(s.c.exercises.filter((e) => has(e.title_en, e.title_ar, e.problem_en, e.problem_ar))
      .map((e) => {
        const topic = s.c.topicById.get(e.topic_id)!;
        return { id: e.id, titleEn: e.title_en, titleAr: e.title_ar, subtitleEn: topic.title_en, subtitleAr: topic.title_ar, parentId: null, url: null };
      })));

    add('interview', take(s.c.questions.filter((x) => has(x.question_en, x.question_ar, x.answer_en, x.answer_ar))
      .map((x) => {
        const topic = s.c.topicById.get(x.topic_id)!;
        return { id: x.id, titleEn: x.question_en, titleAr: x.question_ar, subtitleEn: topic.title_en, subtitleAr: topic.title_ar, parentId: null, url: null };
      })));

    add('resources', take(s.c.resources.filter((r) => has(r.title_en, r.title_ar ?? '', r.source_name))
      .map((r) => ({ id: r.id, titleEn: r.title_en, titleAr: r.title_ar ?? r.title_en, subtitleEn: r.source_name, subtitleAr: r.source_name, parentId: null, url: r.url }))));

    add('notes', take([...s.notes].filter((n) => has(n.title, n.content)).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((n) => ({ id: n.id, titleEn: n.title, titleAr: n.title, subtitleEn: null, subtitleAr: null, parentId: null, url: null }))));

    return { query: q, groups };
  }

  async preferences(): Promise<M.Preferences> {
    return (await this.snapshot()).prefs;
  }

  async savePreferences(body: M.Preferences): Promise<M.Preferences> {
    if (!Number.isInteger(body.dailyGoalMinutes) || body.dailyGoalMinutes < 10 || body.dailyGoalMinutes > 600) {
      throw invalid('dailyGoalMinutes', 'range', 'Daily goal must be between 10 and 600 minutes.');
    }
    if (body.focusSkill !== null && !isOneOf(body.focusSkill, M.SKILLS)) throw invalid('focusSkill', 'invalid', 'Choose a valid skill.');
    if (!isOneOf(body.weekStartsOn, WEEK_DAYS)) throw invalid('weekStartsOn', 'invalid', 'Choose a valid first day of the week.');
    const { error } = await this.db.from('learning_preferences').upsert({
      user_id: this.supabase.userId(), daily_goal_minutes: body.dailyGoalMinutes,
      allow_skipping_prerequisites: body.allowSkippingPrerequisites, focus_skill: body.focusSkill,
      week_starts_on: body.weekStartsOn, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw toApiError(error);
    return { ...body };
  }

  // =====================================================================
  // Loading: content once per session, the user's rows on every call.
  // =====================================================================

  private async snapshot(): Promise<Snapshot> {
    if (!this.supabase.user()) throw new ApiError(401, 'unauthenticated', 'Sign in to continue.');
    const [c, u] = await Promise.all([this.content(), this.userRows()]);
    const today = L.todayLocal();

    const progress = new Map(u.progress.map((p) => [p.topic_id, p]));
    const state = L.buildState(c.phases, c.topics, c.prereqs, new Map(u.progress.map((p) => [p.topic_id, p])));
    const repos = new Map(u.repos.map((r) => [r.project_id, r.repository_url]));
    const portfolioDone = new Map<number, Set<number>>();
    for (const check of u.portfolio.filter((x) => x.is_done)) {
      const set = portfolioDone.get(check.project_id) ?? new Set<number>();
      set.add(check.checklist_item_id);
      portfolioDone.set(check.project_id, set);
    }
    const taskProgress = new Map(u.taskProgress.map((p) => [p.project_task_id, p]));
    const topicIdsByTask = new Map<number, number[]>();
    for (const link of c.taskTopics) topicIdsByTask.set(link.project_task_id, [...(topicIdsByTask.get(link.project_task_id) ?? []), link.topic_id]);

    const projects: L.ProjectView[] = c.projects.map((row) => ({
      row,
      milestones: c.milestones.filter((m) => m.project_id === row.id).map((m) => ({
        row: m,
        tasks: c.tasks.filter((t) => t.milestone_id === m.id).map((t) => ({
          row: t,
          status: taskProgress.get(t.id)?.status ?? 'NotStarted',
          blockedReason: taskProgress.get(t.id)?.blocked_reason ?? null,
          completedAt: taskProgress.get(t.id)?.completed_at ?? null,
          topicIds: topicIdsByTask.get(t.id) ?? [],
        })),
      })),
      portfolioDone: portfolioDone.get(row.id) ?? new Set<number>(),
      repositoryUrl: repos.get(row.id) ?? null,
    }));

    const prefRow = u.prefs[0];
    const prefs: M.Preferences = prefRow
      ? { dailyGoalMinutes: prefRow.daily_goal_minutes, allowSkippingPrerequisites: prefRow.allow_skipping_prerequisites, focusSkill: prefRow.focus_skill, weekStartsOn: prefRow.week_starts_on }
      : { dailyGoalMinutes: 60, allowSkippingPrerequisites: false, focusSkill: null, weekStartsOn: 'Monday' };

    return {
      c, state, progress,
      reviews: new Map(u.reviews.map((r) => [r.topic_id, r])),
      taskProgress,
      portfolio: u.portfolio,
      practice: new Map(u.practice.map((p) => [p.exercise_id, p])),
      interviews: new Map(u.interviews.map((p) => [p.question_id, p])),
      sessions: u.sessions,
      notes: u.notes,
      prefs, repos: new Map([...repos].filter((e): e is [number, string] => e[1] !== null)),
      projects, today,
    };
  }

  private content(): Promise<Content> {
    this.contentCache ??= this.loadContent().catch((e: unknown) => {
      this.contentCache = null;
      throw e;
    });
    return this.contentCache;
  }

  private async loadContent(): Promise<Content> {
    const [phases, topics, prereqs, resources, resourceTopics, projects, milestones, tasks, taskTopics, checklist, exercises, questions] = await Promise.all([
      this.fetchAll<L.PhaseRow>('phases', ['sort_order', 'id']),
      this.fetchAll<TopicRow>('topics', ['sort_order', 'id']),
      this.fetchAll<{ topic_id: number; prerequisite_topic_id: number }>('topic_prerequisites', ['topic_id', 'prerequisite_topic_id']),
      this.fetchAll<ResourceRow>('resources', ['id']),
      this.fetchAll<{ resource_id: number; topic_id: number }>('resource_topics', ['resource_id', 'topic_id']),
      this.fetchAll<L.ProjectRow>('projects', ['sort_order', 'id']),
      this.fetchAll<L.MilestoneRow>('project_milestones', ['sort_order', 'id']),
      this.fetchAll<L.TaskRow>('project_tasks', ['sort_order', 'id']),
      this.fetchAll<{ project_task_id: number; topic_id: number }>('project_task_topics', ['project_task_id', 'topic_id']),
      this.fetchAll<ChecklistRow>('portfolio_checklist_items', ['sort_order', 'id']),
      this.fetchAll<ExerciseRow>('practice_exercises', ['id']),
      this.fetchAll<QuestionRow>('interview_questions', ['id']),
    ]);
    return {
      phases,
      topics, topicById: new Map(topics.map((t) => [t.id, t])),
      prereqs,
      resources, resourceTopics,
      projects, projectById: new Map(projects.map((p) => [p.id, p])),
      milestones,
      tasks, taskById: new Map(tasks.map((t) => [t.id, t])),
      taskTopics,
      checklist, exercises, questions,
    };
  }

  private async userRows() {
    const [progress, reviews, taskProgress, portfolio, practice, interviews, sessions, notes, prefs, repos] = await Promise.all([
      this.fetchAll<TopicProgressRow>('topic_progress', ['topic_id']),
      this.fetchAll<ReviewRow>('review_schedules', ['topic_id']),
      this.fetchAll<TaskProgressRow>('project_task_progress', ['project_task_id']),
      this.fetchAll<PortfolioCheckRow>('portfolio_checks', ['project_id', 'checklist_item_id']),
      this.fetchAll<PracticeProgressRow>('practice_progress', ['exercise_id']),
      this.fetchAll<InterviewProgressRow>('interview_progress', ['question_id']),
      this.fetchAll<SessionRow>('study_sessions', ['id']),
      this.fetchAll<NoteRow>('notes', ['id']),
      this.fetchAll<PreferenceRow>('learning_preferences', ['user_id']),
      this.fetchAll<{ project_id: number; repository_url: string | null }>('project_repositories', ['project_id']),
    ]);
    return { progress, reviews, taskProgress, portfolio, practice, interviews, sessions, notes, prefs, repos };
  }

  /** Reads a whole table in pages. Ordering by a unique column keeps the pages stable. */
  private async fetchAll<T>(table: string, orderBy: string[]): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      let query = this.db.from(table).select('*');
      for (const column of orderBy) query = query.order(column, { ascending: true });
      const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
      if (error) throw toApiError(error);
      rows.push(...((data ?? []) as T[]));
      if ((data ?? []).length < PAGE_SIZE) return rows;
    }
  }

  /** Runs a write and turns a failure into an ApiError with the same shape the pages already handle. */
  private async write(builder: PromiseLike<{ error: unknown }>): Promise<void> {
    const { error } = await builder;
    if (error) throw toApiError(error);
  }

  // =====================================================================
  // Mapping helpers
  // =====================================================================

  private rank(s: Snapshot, availableMinutes: number | null = null): L.ScoredTopic[] {
    return L.rankTopics(s.state, {
      projectNeeds: L.projectNeeds(s.projects, s.c.phases),
      allowSkippingPrerequisites: s.prefs.allowSkippingPrerequisites,
      focusSkill: s.prefs.focusSkill,
      availableMinutes,
    });
  }

  private recommendationDto(s: Snapshot, r: L.ScoredTopic): M.Recommendation {
    return {
      topic: this.topicSummary(s, r.topic),
      phase: L.phaseRef(s.c.phases.find((p) => p.id === r.topic.phaseId)!),
      score: r.score,
      reasons: r.reasons,
    };
  }

  private topicSummary(s: Snapshot, t: L.TopicState): M.TopicSummary {
    const row = s.c.topicById.get(t.id)!;
    return {
      id: t.id, slug: t.slug, phaseId: t.phaseId, order: t.order, skill: t.skill, priority: t.priority,
      estimatedMinutes: t.minutes, titleEn: t.titleEn, titleAr: t.titleAr, summaryEn: row.summary_en, summaryAr: row.summary_ar,
      status: t.status, knowledge: t.knowledge, confidence: t.confidence,
      inReview: s.reviews.has(t.id), prerequisitesMet: L.prerequisitesMet(s.state, t),
    };
  }

  private projectSummaries(s: Snapshot): M.ProjectSummary[] {
    const checklistTotal = s.c.checklist.length;
    return s.projects.map((p) => L.summarizeProject(p, s.c.phases, checklistTotal).summary);
  }

  private projectOfTask(c: Content, taskId: number): L.ProjectRow | null {
    const task = c.taskById.get(taskId);
    const milestone = task ? c.milestones.find((m) => m.id === task.milestone_id) : undefined;
    return milestone ? c.projectById.get(milestone.project_id) ?? null : null;
  }

  /** Recent completions, notes and sessions, newest first. */
  private recentActivity(s: Snapshot): M.Activity[] {
    const take = 8;
    const newestFirst = <T>(rows: T[], at: (r: T) => string | null) =>
      rows.filter((r) => at(r) !== null).sort((a, b) => (at(b)! < at(a)! ? -1 : 1));

    const topics = newestFirst([...s.progress.values()], (p) => p.completed_at).slice(0, take).map((p): M.Activity => {
      const t = s.c.topicById.get(p.topic_id)!;
      return { kind: p.status === 'Skipped' ? 'topicSkipped' : 'topicCompleted', titleEn: t.title_en, titleAr: t.title_ar, at: p.completed_at!, entityId: p.topic_id, parentId: null, minutes: null };
    });
    const notes = [...s.notes].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).slice(0, take).map((n): M.Activity => ({
      kind: n.created_at === n.updated_at ? 'noteCreated' : 'noteUpdated', titleEn: n.title, titleAr: n.title,
      at: n.updated_at, entityId: n.id, parentId: null, minutes: null,
    }));
    const exercises = newestFirst([...s.practice.values()], (p) => p.completed_at).slice(0, take).map((p): M.Activity => {
      const e = s.c.exercises.find((x) => x.id === p.exercise_id)!;
      return { kind: 'exerciseCompleted', titleEn: e.title_en, titleAr: e.title_ar, at: p.completed_at!, entityId: p.exercise_id, parentId: null, minutes: null };
    });
    const tasks = newestFirst([...s.taskProgress.values()], (p) => p.completed_at).slice(0, take).map((p): M.Activity => {
      const t = s.c.taskById.get(p.project_task_id)!;
      return { kind: 'taskCompleted', titleEn: t.title_en, titleAr: t.title_ar, at: p.completed_at!, entityId: p.project_task_id, parentId: this.projectOfTask(s.c, p.project_task_id)?.id ?? null, minutes: null };
    });
    const sessions = [...s.sessions].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, take).map((x): M.Activity => {
      const t = x.topic_id !== null ? s.c.topicById.get(x.topic_id) : undefined;
      const task = x.project_task_id !== null ? s.c.taskById.get(x.project_task_id) : undefined;
      return {
        kind: 'studySession', titleEn: t?.title_en ?? task?.title_en ?? '', titleAr: t?.title_ar ?? task?.title_ar ?? '',
        at: x.created_at, entityId: x.topic_id, parentId: null, minutes: x.actual_minutes,
      };
    });

    return [...topics, ...notes, ...exercises, ...tasks, ...sessions].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 10);
  }

  private dueReviews(s: Snapshot): M.ReviewItem[] {
    return this.reviewItems(s).filter((i) => i.nextReviewOn <= s.today);
  }

  private reviewItems(s: Snapshot): M.ReviewItem[] {
    return [...s.reviews.values()]
      .sort((a, b) => a.next_review_on.localeCompare(b.next_review_on) || a.topic_id - b.topic_id)
      .map((r) => {
        const t = s.state.byId.get(r.topic_id)!;
        return {
          topicId: t.id, slug: t.slug, titleEn: t.titleEn, titleAr: t.titleAr, skill: t.skill, confidence: t.confidence,
          intervalDays: r.interval_days, nextReviewOn: r.next_review_on, lastReviewedOn: r.last_reviewed_on,
          reviewCount: r.review_count, daysOverdue: Math.max(0, L.dayNumber(s.today) - L.dayNumber(r.next_review_on)),
        };
      });
  }

  private reviewState(r: ReviewRow, today: string): M.ReviewState {
    return { intervalDays: r.interval_days, nextReviewOn: r.next_review_on, lastReviewedOn: r.last_reviewed_on, reviewCount: r.review_count, isDue: r.next_review_on <= today };
  }

  private sessionDto(c: Content, x: SessionRow): M.StudySession {
    const topic = x.topic_id !== null ? c.topicById.get(x.topic_id) : undefined;
    const task = x.project_task_id !== null ? c.taskById.get(x.project_task_id) : undefined;
    return {
      id: x.id, topicId: x.topic_id, topicTitleEn: topic?.title_en ?? null, topicTitleAr: topic?.title_ar ?? null,
      projectTaskId: x.project_task_id, taskTitleEn: task?.title_en ?? null, taskTitleAr: task?.title_ar ?? null,
      plannedMinutes: x.planned_minutes, actualMinutes: x.actual_minutes, sessionDate: x.session_date,
      note: x.note, createdAt: x.created_at,
    };
  }

  private resourcesFor(s: Snapshot, keep: (r: ResourceRow) => boolean): M.Resource[] {
    return s.c.resources.filter(keep).sort((a, b) => a.id - b.id).map((r) => ({
      id: r.id, key: r.key, titleEn: r.title_en, titleAr: r.title_ar, url: r.url, sourceName: r.source_name,
      type: r.type, difficulty: r.difficulty, isFree: r.is_free, verificationStatus: r.verification_status,
      lastVerifiedAt: r.last_verified_at, lastStatusCode: r.last_status_code,
      topics: s.c.resourceTopics.filter((l) => l.resource_id === r.id)
        .map((l) => s.state.byId.get(l.topic_id)).filter((t): t is L.TopicState => t !== undefined)
        .sort((a, b) => a.id - b.id).map(L.topicRef),
    }));
  }

  private exerciseSummaries(s: Snapshot): M.ExerciseSummary[] {
    return s.c.exercises
      .map((e) => ({ e, topic: s.state.byId.get(e.topic_id)! }))
      .sort((a, b) => a.topic.phaseOrder - b.topic.phaseOrder || a.topic.order - b.topic.order || a.e.id - b.e.id)
      .map(({ e, topic }) => {
        const titles = s.c.topicById.get(e.topic_id)!;
        return {
          id: e.id, key: e.key, type: e.type, topicId: e.topic_id, topicTitleEn: titles.title_en, topicTitleAr: titles.title_ar,
          difficulty: e.difficulty, estimatedMinutes: e.estimated_minutes, titleEn: e.title_en, titleAr: e.title_ar,
          status: s.practice.get(e.id)?.status ?? 'NotStarted',
        };
      });
  }

  private exerciseOrThrow(s: Snapshot, id: number): ExerciseRow {
    const ex = s.c.exercises.find((e) => e.id === id);
    if (!ex) throw notFound('PracticeExercise');
    return ex;
  }

  private exerciseDetail(s: Snapshot, id: number): M.ExerciseDetail {
    const ex = this.exerciseOrThrow(s, id)!;
    const p = s.practice.get(id);
    const summary = this.exerciseSummaries(s).find((e) => e.id === id)!;
    const hintsEn = L.splitLines(ex.hints_en);
    const hintsAr = L.splitLines(ex.hints_ar);
    const revealed = Math.min(p?.hints_revealed ?? 0, hintsEn.length);
    const showSolution = p?.solution_revealed === true;
    return {
      summary, problemEn: ex.problem_en, problemAr: ex.problem_ar, code: ex.code, codeLanguage: ex.code_language,
      expectedOutcomeEn: ex.expected_outcome_en, expectedOutcomeAr: ex.expected_outcome_ar,
      hintCount: hintsEn.length, revealedHintsEn: hintsEn.slice(0, revealed), revealedHintsAr: hintsAr.slice(0, revealed),
      userAnswer: p?.user_answer ?? null, solutionRevealed: showSolution,
      solutionEn: showSolution ? ex.solution_en : null, solutionAr: showSolution ? ex.solution_ar : null,
      solutionCode: showSolution ? ex.solution_code : null, completedAt: p?.completed_at ?? null,
    };
  }

  private async writePractice(id: number, s: Snapshot, patch: Partial<PracticeProgressRow>): Promise<void> {
    const current = s.practice.get(id);
    const now = new Date().toISOString();
    const row: PracticeProgressRow = {
      exercise_id: id, status: 'NotStarted', user_answer: null, hints_revealed: 0, solution_revealed: false,
      completed_at: null,
      ...current, ...patch, updated_at: now,
    };
    await this.write(this.db.from('practice_progress').upsert({ user_id: this.supabase.userId(), ...row }, { onConflict: 'user_id,exercise_id' }));
  }

  private questionDtos(s: Snapshot): M.InterviewQuestion[] {
    return s.c.questions.map((q) => {
      const topic = s.c.topicById.get(q.topic_id)!;
      const p = s.interviews.get(q.id);
      return {
        id: q.id, key: q.key, category: q.category, topicId: q.topic_id, topicTitleEn: topic.title_en, topicTitleAr: topic.title_ar,
        difficulty: q.difficulty, questionEn: q.question_en, questionAr: q.question_ar, answerEn: q.answer_en, answerAr: q.answer_ar,
        exampleCode: q.example_code, followUpEn: q.follow_up_en, followUpAr: q.follow_up_ar,
        rating: p?.rating ?? null, timesPracticed: p?.times_practiced ?? 0, lastPracticedAt: p?.last_practiced_at ?? null,
      };
    });
  }

  private noteDto(c: Content, n: NoteRow): M.Note {
    const linkType: M.NoteLinkType | null = n.topic_id !== null ? 'topic' : n.project_id !== null ? 'project'
      : n.project_task_id !== null ? 'task' : n.interview_question_id !== null ? 'question' : null;
    const linkId = n.topic_id ?? n.project_id ?? n.project_task_id ?? n.interview_question_id;
    let titleEn: string | null = null, titleAr: string | null = null, parentId: number | null = null;
    if (n.topic_id !== null) { const t = c.topicById.get(n.topic_id); titleEn = t?.title_en ?? null; titleAr = t?.title_ar ?? null; }
    else if (n.project_id !== null) { const p = c.projectById.get(n.project_id); titleEn = p?.title_en ?? null; titleAr = p?.title_ar ?? null; }
    else if (n.project_task_id !== null) {
      const t = c.taskById.get(n.project_task_id);
      titleEn = t?.title_en ?? null; titleAr = t?.title_ar ?? null;
      parentId = this.projectOfTask(c, n.project_task_id)?.id ?? null;
    } else if (n.interview_question_id !== null) {
      const q = c.questions.find((x) => x.id === n.interview_question_id);
      titleEn = q?.question_en ?? null; titleAr = q?.question_ar ?? null;
    }
    return {
      id: n.id, title: n.title, content: n.content, linkType, linkId: linkId ?? null,
      linkTitleEn: titleEn, linkTitleAr: titleAr, linkParentId: parentId, createdAt: n.created_at, updatedAt: n.updated_at,
    };
  }

  private validateNote(c: Content, body: M.NoteRequest): void {
    const title = body.title?.trim() ?? '';
    if (title.length === 0) throw invalid('title', 'required', 'A title is required.');
    if (title.length > 200) throw invalid('title', 'maxLength', 'Titles can be at most 200 characters.');
    if ((body.content ?? '').length > 20000) throw invalid('content', 'maxLength', 'Notes can be at most 20000 characters.');
    const links = [body.topicId, body.projectId, body.projectTaskId, body.interviewQuestionId].filter((x) => x !== null && x !== undefined);
    if (links.length > 1) throw invalid('topicId', 'singleLink', 'A note can be linked to only one item.');
    if (body.topicId !== null && !c.topicById.has(body.topicId)) throw invalid('topicId', 'notFound', 'Topic does not exist.');
    if (body.projectId !== null && !c.projectById.has(body.projectId)) throw invalid('projectId', 'notFound', 'Project does not exist.');
    if (body.projectTaskId !== null && !c.taskById.has(body.projectTaskId)) throw invalid('projectTaskId', 'notFound', 'Project task does not exist.');
    if (body.interviewQuestionId !== null && !c.questions.some((q) => q.id === body.interviewQuestionId)) {
      throw invalid('interviewQuestionId', 'notFound', 'Interview question does not exist.');
    }
  }

  private planItem(s: Snapshot, kind: M.StudyPlanItem['kind'], minutes: number, topic: L.TopicState | null, ranked: L.ScoredTopic[]): M.StudyPlanItem | null {
    const base = { minutes, exerciseId: null, projectId: null, projectTaskId: null, interviewCategory: null };
    const learn = (t: L.TopicState | null | undefined): M.StudyPlanItem | null =>
      t ? { ...base, kind: 'learn', titleEn: t.titleEn, titleAr: t.titleAr, topicId: t.id } : null;

    switch (kind) {
      case 'learn':
        return learn(topic);
      case 'practice': {
        if (!topic) return null;
        const exercise = s.c.exercises
          .filter((e) => e.topic_id === topic.id && s.practice.get(e.id)?.status !== 'Completed')
          .sort((a, b) => L.exerciseTypeRank(a.type) - L.exerciseTypeRank(b.type) || a.id - b.id)[0];
        return exercise
          ? { ...base, kind: 'exercise', titleEn: exercise.title_en, titleAr: exercise.title_ar, topicId: topic.id, exerciseId: exercise.id }
          : { ...base, kind: 'practice', titleEn: topic.titleEn, titleAr: topic.titleAr, topicId: topic.id };
      }
      case 'challenge':
        return topic ? { ...base, kind: 'challenge', titleEn: topic.titleEn, titleAr: topic.titleAr, topicId: topic.id } : null;
      case 'review': {
        const due = [...s.reviews.values()].filter((r) => r.next_review_on <= s.today).sort((a, b) => a.next_review_on.localeCompare(b.next_review_on))[0];
        if (due) {
          const t = s.state.byId.get(due.topic_id)!;
          return { ...base, kind: 'review', titleEn: t.titleEn, titleAr: t.titleAr, topicId: t.id };
        }
        return learn(ranked[1]?.topic ?? topic);
      }
      case 'project': {
        const next = L.nextProjectTask(s.projects, s.c.phases);
        if (next) {
          return { ...base, kind: 'project', titleEn: next.task.row.title_en, titleAr: next.task.row.title_ar, projectId: next.project.row.id, projectTaskId: next.task.row.id, topicId: null };
        }
        return learn(topic);
      }
      case 'interview': {
        const category = L.interviewCategoryFor(topic?.skill ?? 'CSharp');
        return { ...base, kind: 'interview', titleEn: category, titleAr: category, topicId: topic?.id ?? null, interviewCategory: category };
      }
      default:
        return null;
    }
  }
}

// ---------- Module helpers ----------

const STATUSES: readonly M.TopicStatus[] = ['NotStarted', 'InProgress', 'Completed', 'Skipped'];
const KNOWLEDGE: readonly M.KnowledgeLevel[] = ['Unassessed', 'AlreadyKnow', 'NeedReview', 'NeedToLearn'];
const RATINGS: readonly M.InterviewRating[] = ['NeedReview', 'Partial', 'Confident'];
const WEEK_DAYS: readonly M.DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const isOneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value);

const qStr = (v: Query[string]): string | null => (v === null || v === undefined || v === '' ? null : String(v));
const qNum = (v: Query[string]): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Starting an attempt or a hint moves a NotStarted exercise to Attempted, and leaves other statuses alone. */
const attemptedStatus = (s: Snapshot, id: number): M.PracticeStatus => {
  const status = s.practice.get(id)?.status ?? 'NotStarted';
  return status === 'NotStarted' ? 'Attempted' : status;
};

const phaseTitle = (s: Snapshot, phaseId: number, lang: 'en' | 'ar') => {
  const p = s.c.phases.find((x) => x.id === phaseId);
  return p ? (lang === 'en' ? p.title_en : p.title_ar) : null;
};

const notFound = (entity: string) => new ApiError(404, 'not_found', `${entity} was not found.`);
const conflict = (code: string, message: string) => new ApiError(409, code, message);
const invalid = (field: string, code: string, message: string) =>
  new ApiError(400, 'validation_failed', 'One or more validation errors occurred.', { [field]: [message] });

/** Maps Supabase and Postgres errors onto ApiError, using the statuses the pages already handle. */
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) return new ApiError(0, 'offline', 'The database is not reachable.');
  const e = error as { code?: string; message?: string };
  switch (e.code) {
    case '42501': return new ApiError(403, 'forbidden', 'You are not allowed to do that. Sign in and try again.');
    case '23503': return new ApiError(400, 'not_found', e.message ?? 'A linked item does not exist.');
    case '23505': return new ApiError(409, 'conflict', e.message ?? 'That item already exists.');
    default: return new ApiError(500, 'server_error', e.message ?? 'Something went wrong.');
  }
}

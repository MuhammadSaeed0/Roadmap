// Pure learning rules, ported from the former .NET services (ProgressCalculator,
// RecommendationEngine, ReviewRules, ProjectService, CareerReadinessService and the
// analytics code). Nothing here touches the network, so every rule can be unit-tested.
// The weights and scores match the values that were in appsettings.json and the
// RecommendationEngine constants.

import * as M from './models';

// ---------- Enum order (the database stores enums as text, so sort in code) ----------

const order = <T extends string>(values: readonly T[]) => (value: T) => values.indexOf(value);
export const skillRank = order(M.SKILLS);
export const priorityRank = order<M.TopicPriority>(['Core', 'Important', 'Optional']);
export const exerciseTypeRank = order<M.ExerciseType>(M.EXERCISE_TYPES);
export const difficultyRank = order<M.Difficulty>(['Beginner', 'Intermediate', 'Advanced']);
export const interviewCategoryRank = order(M.INTERVIEW_CATEGORIES);
export const resourceTypeRank = order<M.ResourceType>(['Documentation', 'Tutorial', 'Course', 'Video', 'Article', 'Reference', 'Tool']);

// ---------- Weights (appsettings.json "Progress" section) ----------

export const SKILL_WEIGHTS: Record<M.SkillArea, number> = {
  CSharp: 1.0, AspNetCore: 1.0, EfCore: 1.0, SqlServer: 0.4, TypeScript: 0.8,
  Angular: 1.0, FullStack: 1.0, Testing: 0.9, Git: 0.6, Professional: 0.7,
};
export const PRIORITY_WEIGHTS: Record<M.TopicPriority, number> = { Core: 3, Important: 2, Optional: 1 };

const weightOf = (skill: M.SkillArea, priority: M.TopicPriority) => SKILL_WEIGHTS[skill] * PRIORITY_WEIGHTS[priority];

// ---------- Small helpers ----------

export const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (done: number, total: number) => (total <= 0 ? 0 : round1((done / total) * 100));
export const splitLines = (text: string | null | undefined): string[] =>
  (text ?? '').split('\n').map((s) => s.trim()).filter((s) => s.length > 0);

const DAY_NAMES: M.DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Dates are YYYY-MM-DD strings, as in the API. Arithmetic is done in UTC so DST never shifts a day. */
export function todayLocal(now = new Date()): string {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
export function dayNumber(date: string): number {
  const [y, m, d] = parts(date);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}
/** First day of the week containing `date`, for a week that starts on `startsOn`. */
export function weekStart(date: string, startsOn: M.DayOfWeek): string {
  const [y, m, d] = parts(date);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const diff = (((dow - DAY_NAMES.indexOf(startsOn)) % 7) + 7) % 7;
  return addDays(date, -diff);
}
/** Local midnight of a YYYY-MM-DD date as an ISO timestamp, for comparing with timestamptz columns. */
export function localMidnightIso(date: string): string {
  const [y, m, d] = parts(date);
  return new Date(y, m - 1, d).toISOString();
}
function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y, m, d];
}
function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ---------- Learning state: the roadmap with progress applied ----------

export interface PhaseRow { id: number; slug: string; sort_order: number; title_en: string; title_ar: string; description_en: string; description_ar: string; }

export interface TopicState {
  id: number; slug: string; phaseId: number; phaseOrder: number; order: number;
  skill: M.SkillArea; priority: M.TopicPriority; minutes: number;
  titleEn: string; titleAr: string;
  status: M.TopicStatus; knowledge: M.KnowledgeLevel; confidence: number | null; completedAt: string | null;
  prereqIds: number[];
  isDone: boolean;
}

export interface LearningState {
  phases: PhaseRow[];
  topics: TopicState[];
  byId: Map<number, TopicState>;
  /** Prerequisite id -> ids of topics that require it. */
  dependents: Map<number, number[]>;
}

export interface TopicStateInput {
  id: number; slug: string; phase_id: number; sort_order: number; skill: M.SkillArea; priority: M.TopicPriority;
  estimated_minutes: number; title_en: string; title_ar: string;
}

export function buildState(
  phases: PhaseRow[],
  topics: TopicStateInput[],
  prereqs: { topic_id: number; prerequisite_topic_id: number }[],
  progress: Map<number, { status: M.TopicStatus; knowledge: M.KnowledgeLevel; confidence: number | null; completed_at: string | null }>,
): LearningState {
  const phaseOrder = new Map(phases.map((p) => [p.id, p.sort_order]));
  const prereqsOf = new Map<number, number[]>();
  for (const p of prereqs) prereqsOf.set(p.topic_id, [...(prereqsOf.get(p.topic_id) ?? []), p.prerequisite_topic_id]);

  const states = topics
    .map((t): TopicState => {
      const pr = progress.get(t.id);
      const status = pr?.status ?? 'NotStarted';
      return {
        id: t.id, slug: t.slug, phaseId: t.phase_id, phaseOrder: phaseOrder.get(t.phase_id) ?? 0, order: t.sort_order,
        skill: t.skill, priority: t.priority, minutes: t.estimated_minutes, titleEn: t.title_en, titleAr: t.title_ar,
        status, knowledge: pr?.knowledge ?? 'Unassessed', confidence: pr?.confidence ?? null,
        completedAt: pr?.completed_at ?? null, prereqIds: prereqsOf.get(t.id) ?? [],
        isDone: status === 'Completed' || status === 'Skipped',
      };
    })
    .sort((a, b) => a.phaseOrder - b.phaseOrder || a.order - b.order);

  const byId = new Map(states.map((t) => [t.id, t]));
  const dependents = new Map<number, number[]>();
  for (const t of states) for (const p of t.prereqIds) dependents.set(p, [...(dependents.get(p) ?? []), t.id]);
  return { phases: [...phases].sort((a, b) => a.sort_order - b.sort_order), topics: states, byId, dependents };
}

export const prerequisitesMet = (state: LearningState, t: TopicState) =>
  t.prereqIds.every((id) => state.byId.get(id)?.isDone === true);

export const phaseRef = (p: PhaseRow): M.PhaseRef => ({ id: p.id, slug: p.slug, order: p.sort_order, titleEn: p.title_en, titleAr: p.title_ar });
export const topicRef = (t: TopicState): M.TopicRef => ({ id: t.id, slug: t.slug, titleEn: t.titleEn, titleAr: t.titleAr, skill: t.skill, status: t.status });

export function weightedPercent(topics: TopicState[]): number {
  let total = 0, done = 0;
  for (const t of topics) {
    const w = weightOf(t.skill, t.priority);
    total += w;
    if (t.isDone) done += w;
  }
  return total === 0 ? 0 : round1((done / total) * 100);
}

/** The first phase with an unfinished Core topic, otherwise the first phase with any unfinished topic. */
export function currentPhase(state: LearningState): PhaseRow | null {
  const open = (p: PhaseRow, core: boolean) =>
    state.topics.some((t) => t.phaseId === p.id && !t.isDone && (!core || t.priority === 'Core'));
  return state.phases.find((p) => open(p, true)) ?? state.phases.find((p) => open(p, false)) ?? null;
}

export function overallProgress(state: LearningState): M.OverallProgress {
  const done = state.topics.filter((t) => t.isDone).length;
  const current = currentPhase(state);
  return {
    percent: weightedPercent(state.topics),
    doneTopics: done,
    remainingTopics: state.topics.length - done,
    totalTopics: state.topics.length,
    remainingMinutes: state.topics.filter((t) => !t.isDone)
      .reduce((sum, t) => sum + (t.status === 'InProgress' ? Math.floor(t.minutes / 2) : t.minutes), 0),
    currentPhase: current ? phaseRef(current) : null,
  };
}

export function bySkill(state: LearningState): M.SkillProgress[] {
  return M.SKILLS.map((skill) => {
    const topics = state.topics.filter((t) => t.skill === skill);
    const rated = topics.filter((t) => t.confidence !== null);
    return {
      skill,
      percent: weightedPercent(topics),
      done: topics.filter((t) => t.isDone).length,
      total: topics.length,
      averageConfidence: rated.length === 0 ? null : round1(rated.reduce((s, t) => s + (t.confidence ?? 0), 0) / rated.length),
      weight: SKILL_WEIGHTS[skill],
    };
  }).filter((s) => s.total > 0);
}

export function byPhase(state: LearningState): M.ProgressReport['phases'] {
  return state.phases
    .filter((p) => state.topics.some((t) => t.phaseId === p.id))
    .map((p) => {
      const topics = state.topics.filter((t) => t.phaseId === p.id);
      return {
        id: p.id, order: p.sort_order, titleEn: p.title_en, titleAr: p.title_ar,
        percent: weightedPercent(topics), done: topics.filter((t) => t.isDone).length, total: topics.length,
      };
    });
}

export function confidenceDistribution(state: LearningState): M.ProgressReport['confidence'] {
  const buckets = [{ level: 'unrated', count: state.topics.filter((t) => t.confidence === null).length }];
  for (let level = 0; level <= 5; level++) {
    buckets.push({ level: String(level), count: state.topics.filter((t) => t.confidence === level).length });
  }
  return buckets;
}

/** Things finished with low confidence, or flagged as gaps. */
export function weakAreas(state: LearningState, take = 12): M.WeakTopic[] {
  const reasonOf = (t: TopicState): string | null =>
    t.isDone && t.status !== 'Skipped' && t.confidence !== null && t.confidence <= 2 ? 'completedLowConfidence'
    : t.knowledge === 'NeedReview' ? 'markedNeedReview'
    : t.status === 'InProgress' && t.confidence !== null && t.confidence <= 1 ? 'inProgressLowConfidence'
    : null;
  return state.topics
    .map((t) => ({ t, reason: reasonOf(t) }))
    .filter((x): x is { t: TopicState; reason: string } => x.reason !== null)
    .sort((a, b) => (a.t.confidence ?? 0) - (b.t.confidence ?? 0) || a.t.phaseOrder - b.t.phaseOrder || a.t.order - b.t.order)
    .slice(0, take)
    .map((x) => ({ topic: topicRef(x.t), confidence: x.t.confidence, reason: x.reason }));
}

// ---------- Review (spaced repetition) ----------

const REVIEW_DAYS_BY_CONFIDENCE = [1, 1, 2, 4, 8, 16];

export const reviewIntervalDays = (confidence: number | null | undefined) =>
  REVIEW_DAYS_BY_CONFIDENCE[Math.min(5, Math.max(0, confidence ?? 0))];

export const REVIEW_RULES = REVIEW_DAYS_BY_CONFIDENCE.map((days, confidence) => ({ confidence, days }));

// ---------- Recommendations ----------

export interface ProjectNeed { projectId: number; titleEn: string; titleAr: string; }

export interface ScoredTopic { topic: TopicState; score: number; reasons: M.Reason[]; }

// The scoring table. Keep in sync with the explanation in the Settings page.
const SCORE = {
  inProgress: 40, currentPhase: 30, earlierPhase: 20, laterPhasePenaltyPerStep: 6,
  core: 20, important: 10, needToLearn: 12, needReview: 6, alreadyKnowPenalty: 40,
  lowConfidence: 6, project: 18, unlockPerTopic: 3, unlockCap: 12, focusSkill: 15,
  fitsTime: 5, tooLongPenalty: 20, skippedPrerequisitePenalty: 15,
};

export function rankTopics(
  state: LearningState,
  opts: { projectNeeds: Map<number, ProjectNeed>; allowSkippingPrerequisites: boolean; focusSkill: M.SkillArea | null; availableMinutes: number | null },
): ScoredTopic[] {
  const current = currentPhase(state);
  const results: ScoredTopic[] = [];

  for (const t of state.topics) {
    if (t.isDone) continue;
    const met = prerequisitesMet(state, t);
    if (!met && !opts.allowSkippingPrerequisites) continue;

    let score = 0;
    const reasons: M.Reason[] = [];
    const add = (points: number, code: string, params: Record<string, string> | null = null) => {
      score += points;
      if (points > 0 || code.startsWith('!')) reasons.push({ code: code.replace(/^!/, ''), params });
    };

    if (t.status === 'InProgress') add(SCORE.inProgress, 'inProgress');

    if (current) {
      if (t.phaseId === current.id) add(SCORE.currentPhase, 'currentPhase');
      else if (t.phaseOrder < current.sort_order) add(SCORE.earlierPhase, 'earlierPhase');
      else score -= SCORE.laterPhasePenaltyPerStep * (t.phaseOrder - current.sort_order);
    }

    if (t.priority === 'Core') add(SCORE.core, 'corePriority');
    else if (t.priority === 'Important') add(SCORE.important, 'importantPriority');

    if (t.knowledge === 'NeedToLearn') add(SCORE.needToLearn, 'knowledgeGap');
    else if (t.knowledge === 'NeedReview') add(SCORE.needReview, 'needsReview');
    else if (t.knowledge === 'AlreadyKnow') score -= SCORE.alreadyKnowPenalty;

    if (t.confidence !== null && t.confidence <= 2) add(SCORE.lowConfidence, 'lowConfidence');

    const need = opts.projectNeeds.get(t.id);
    if (need) {
      add(SCORE.project, 'neededForProject', { projectEn: need.titleEn, projectAr: need.titleAr, projectId: String(need.projectId) });
    }

    const unlocks = (state.dependents.get(t.id) ?? []).filter((id) => !state.byId.get(id)?.isDone).length;
    if (unlocks > 0) {
      const points = Math.min(SCORE.unlockCap, unlocks * SCORE.unlockPerTopic);
      if (unlocks >= 2) add(points, 'unlocks', { count: String(unlocks) });
      else score += points;
    }

    if (opts.focusSkill === t.skill) add(SCORE.focusSkill, 'focusSkill');

    if (opts.availableMinutes !== null) {
      if (t.minutes <= opts.availableMinutes) add(SCORE.fitsTime, 'fitsTime', { minutes: String(t.minutes) });
      else score -= SCORE.tooLongPenalty;
    }

    if (!met) add(-SCORE.skippedPrerequisitePenalty, '!prerequisitesSkipped');

    results.push({ topic: t, score, reasons });
  }

  return results.sort((a, b) => b.score - a.score || a.topic.phaseOrder - b.topic.phaseOrder || a.topic.order - b.topic.order);
}

// ---------- Projects ----------

export interface TaskRow {
  id: number; key: string; milestone_id: number; sort_order: number; title_en: string; title_ar: string;
  description_en: string; description_ar: string; acceptance_criteria_en: string; acceptance_criteria_ar: string;
  estimated_minutes: number; priority: M.TaskPriority; is_change_request: boolean; unlock_at_percent: number;
}
export interface MilestoneRow {
  id: number; key: string; project_id: number; sort_order: number; title_en: string; title_ar: string;
  description_en: string; description_ar: string;
}
export interface ProjectRow {
  id: number; slug: string; sort_order: number; title_en: string; title_ar: string; summary_en: string; summary_ar: string;
  requirements_en: string; requirements_ar: string; tech_stack: string; start_after_phase_id: number;
}

/** A project with its milestones, tasks and the progress the user has made, ready for the rules below. */
export interface ProjectView {
  row: ProjectRow;
  milestones: { row: MilestoneRow; tasks: { row: TaskRow; status: M.ProjectTaskStatus; blockedReason: string | null; completedAt: string | null; topicIds: number[] }[] }[];
  portfolioDone: Set<number>;
  repositoryUrl: string | null;
}

export interface ProjectSummaryCalc {
  summary: M.ProjectSummary;
  percent: number;
  allTasks: ProjectView['milestones'][number]['tasks'];
}

export function summarizeProject(p: ProjectView, phases: PhaseRow[], checklistTotal: number): ProjectSummaryCalc {
  const all = p.milestones.flatMap((m) => m.tasks);
  const core = all.filter((t) => !t.row.is_change_request);
  const completed = core.filter((t) => t.status === 'Completed').length;
  const percent = core.length === 0 ? 0 : round1((completed * 100) / core.length);
  const touched = all.some((t) => t.status !== 'NotStarted');
  const status: M.ProjectSummary['status'] = percent >= 100 ? 'completed' : touched ? 'active' : 'notStarted';
  const current = p.milestones.find((m) => m.tasks.some((t) => !t.row.is_change_request && t.status !== 'Completed'));
  const crs = all.filter((t) => t.row.is_change_request);
  const startPhase = phases.find((ph) => ph.id === p.row.start_after_phase_id);
  const summary: M.ProjectSummary = {
    id: p.row.id, slug: p.row.slug, order: p.row.sort_order, titleEn: p.row.title_en, titleAr: p.row.title_ar,
    summaryEn: p.row.summary_en, summaryAr: p.row.summary_ar, techStack: p.row.tech_stack,
    startAfterPhase: startPhase ? phaseRef(startPhase) : { id: p.row.start_after_phase_id, slug: '', order: 0, titleEn: '', titleAr: '' },
    totalTasks: core.length, completedTasks: completed,
    inProgressTasks: core.filter((t) => t.status === 'InProgress').length,
    blockedTasks: core.filter((t) => t.status === 'Blocked').length,
    percent, status,
    currentMilestoneEn: current?.row.title_en ?? null, currentMilestoneAr: current?.row.title_ar ?? null,
    changeRequestsUnlocked: crs.filter((t) => percent >= t.row.unlock_at_percent).length,
    changeRequestsDone: crs.filter((t) => t.status === 'Completed').length,
    portfolioDone: p.portfolioDone.size, portfolioTotal: checklistTotal,
  };
  return { summary, percent, allTasks: all };
}

export function toProjectTask(
  t: ProjectView['milestones'][number]['tasks'][number],
  projectPercent: number,
  topicsById: Map<number, TopicState>,
): M.ProjectTask {
  return {
    id: t.row.id, key: t.row.key, milestoneId: t.row.milestone_id, order: t.row.sort_order,
    titleEn: t.row.title_en, titleAr: t.row.title_ar, descriptionEn: t.row.description_en, descriptionAr: t.row.description_ar,
    criteriaEn: splitLines(t.row.acceptance_criteria_en), criteriaAr: splitLines(t.row.acceptance_criteria_ar),
    estimatedMinutes: t.row.estimated_minutes, priority: t.row.priority, isChangeRequest: t.row.is_change_request,
    unlockAtPercent: t.row.unlock_at_percent,
    isLocked: t.row.is_change_request && projectPercent < t.row.unlock_at_percent,
    status: t.status, blockedReason: t.blockedReason, completedAt: t.completedAt,
    topics: t.topicIds
      .map((id) => topicsById.get(id))
      .filter((x): x is TopicState => x !== undefined)
      .sort((a, b) => a.id - b.id)
      .map(topicRef),
  };
}

/** Topics needed by unfinished, unlocked tasks of the active project (or the next one). */
export function projectNeeds(projects: ProjectView[], phases: PhaseRow[]): Map<number, ProjectNeed> {
  const summaries = new Map(projects.map((p) => [p.row.id, summarizeProject(p, phases, 0)]));
  const focus = projects.filter((p) => summaries.get(p.row.id)!.summary.status === 'active');
  const next = projects.find((p) => summaries.get(p.row.id)!.summary.status === 'notStarted');
  if (next) focus.push(next);

  const needs = new Map<number, ProjectNeed>();
  for (const p of [...focus].sort((a, b) => a.row.sort_order - b.row.sort_order)) {
    const percent = summaries.get(p.row.id)!.percent;
    for (const task of p.milestones.flatMap((m) => m.tasks)) {
      if (task.status === 'Completed') continue;
      if (task.row.is_change_request && percent < task.row.unlock_at_percent) continue;
      for (const topicId of task.topicIds) {
        if (!needs.has(topicId)) needs.set(topicId, { projectId: p.row.id, titleEn: p.row.title_en, titleAr: p.row.title_ar });
      }
    }
  }
  return needs;
}

/** The next unfinished, unlocked task in the first active (or next) project. */
export function nextProjectTask(projects: ProjectView[], phases: PhaseRow[]): { task: ProjectView['milestones'][number]['tasks'][number]; project: ProjectView } | null {
  const ordered = projects
    .map((p) => ({ p, s: summarizeProject(p, phases, 0) }))
    .filter((x) => x.s.summary.status !== 'completed')
    .sort((a, b) => (a.s.summary.status === 'active' ? 0 : 1) - (b.s.summary.status === 'active' ? 0 : 1) || a.p.row.sort_order - b.p.row.sort_order);

  for (const { p, s } of ordered) {
    for (const m of p.milestones) {
      const task = m.tasks.find((t) =>
        (!t.row.is_change_request || s.percent >= t.row.unlock_at_percent) && (t.status === 'NotStarted' || t.status === 'InProgress'));
      if (task) return { task, project: p };
    }
  }
  return null;
}

// ---------- Study plan ----------

export const CATEGORY_FOR_SKILL: Partial<Record<M.SkillArea, M.InterviewCategory>> = {
  CSharp: 'CSharp', AspNetCore: 'AspNetCore', EfCore: 'EfCore', SqlServer: 'SqlServer',
  TypeScript: 'TypeScript', Angular: 'Angular', Testing: 'Testing', Git: 'Git',
};
export const interviewCategoryFor = (skill: M.SkillArea): M.InterviewCategory => CATEGORY_FOR_SKILL[skill] ?? 'FullStackDesign';

type PlanKind = M.StudyPlanItem['kind'];
const SHORT: [PlanKind, number][] = [['learn', 0.5], ['practice', 0.33], ['interview', 0.17]];
const MEDIUM: [PlanKind, number][] = [['learn', 0.35], ['practice', 0.4], ['challenge', 0.25]];
const LONG: [PlanKind, number][] = [['review', 0.1], ['learn', 0.3], ['practice', 0.25], ['project', 0.25], ['interview', 0.1]];

/** Splits the session into 5-minute steps; the last activity absorbs the rounding. */
export function planDurations(minutes: number): { kind: PlanKind; minutes: number }[] {
  const template = minutes <= 45 ? SHORT : minutes <= 90 ? MEDIUM : LONG;
  const durations = template.map(([, share]) => Math.max(5, Math.round((minutes * share) / 5) * 5));
  durations[durations.length - 1] = Math.max(5, minutes - durations.slice(0, -1).reduce((s, d) => s + d, 0));
  return template.map(([kind], i) => ({ kind, minutes: durations[i] }));
}

export function mergeConsecutive(items: M.StudyPlanItem[]): M.StudyPlanItem[] {
  const merged: M.StudyPlanItem[] = [];
  for (const item of items) {
    const last = merged[merged.length - 1];
    if (last && last.kind === item.kind && last.topicId === item.topicId && last.exerciseId === item.exerciseId) {
      merged[merged.length - 1] = { ...last, minutes: last.minutes + item.minutes };
    } else {
      merged.push(item);
    }
  }
  return merged;
}

// ---------- Career readiness ----------

const KEY_SKILLS: M.SkillArea[] = ['CSharp', 'AspNetCore', 'EfCore', 'TypeScript', 'Angular', 'FullStack'];
const PROJECT_WEIGHTS: Record<number, number> = { 1: 0.15, 2: 0.25, 3: 0.2, 4: 0.4 };

export const readinessLevel = (score: number): M.ReadinessArea['level'] =>
  score < 25 ? 'gap' : score < 50 ? 'developing' : score < 80 ? 'solid' : 'strong';

export interface ReadinessInput {
  state: LearningState;
  summaries: M.ProjectSummary[];
  allProjectTasks: { projectTaskId: number; isChangeRequest: boolean; linkedTopicIds: number[]; done: boolean }[];
  exercises: { type: M.ExerciseType; done: boolean }[];
  ratings: (M.InterviewRating | null)[];
  checklist: { id: number; key: string; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string }[];
  portfolioChecks: { projectId: number; checklistItemId: number }[];
}

export function careerReadiness(input: ReadinessInput): M.CareerReadiness {
  const { state, summaries } = input;
  const areas: M.ReadinessArea[] = [];
  const area = (key: string, score: number, evidence: M.ReadinessArea['evidence'], nextStep: M.Reason): void =>
    void areas.push({ key, score, level: readinessLevel(score), evidence, nextStep });
  const topicStep = (code: string, t: TopicState): M.Reason => ({ code, params: { en: t.titleEn, ar: t.titleAr, topicId: String(t.id) } });
  const projectStep = (code: string, p: M.ProjectSummary): M.Reason => ({ code, params: { en: p.titleEn, ar: p.titleAr, projectId: String(p.id) } });

  // 1. Core topics (SQL Server excluded, so existing expertise doesn't mask gaps).
  const core = state.topics.filter((t) => t.priority === 'Core' && t.skill !== 'SqlServer');
  const coreDone = core.filter((t) => t.isDone).length;
  const firstCoreGap = core.find((t) => !t.isDone);
  area('coreTopics', pct(coreDone, core.length),
    [{ code: 'coreTopicsDone', value: coreDone, target: core.length }],
    firstCoreGap ? topicStep('studyTopic', firstCoreGap) : { code: 'keepReviewing', params: null });

  // 2. Confidence in key skills (unrated counts as 0).
  const key = state.topics.filter((t) => KEY_SKILLS.includes(t.skill) && t.priority === 'Core');
  const avg = key.length === 0 ? 0 : key.reduce((s, t) => s + (t.confidence ?? 0), 0) / key.length;
  const independent = key.filter((t) => (t.confidence ?? -1) >= 4).length;
  const weakest = key.filter((t) => t.isDone).sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))[0];
  area('confidence', round1((avg / 5) * 100),
    [{ code: 'averageConfidence', value: round1(avg), target: 4 }, { code: 'independentTopics', value: independent, target: key.length }],
    weakest && (weakest.confidence ?? 0) < 4 ? topicStep('reviewTopic', weakest) : { code: 'rateConfidence', params: null });

  // 3. Projects, weighted towards the portfolio project (order 4).
  const projectScore = summaries.reduce((s, p) => s + p.percent * (PROJECT_WEIGHTS[p.order] ?? 0.25), 0);
  const nextProject = summaries.find((p) => p.status !== 'completed');
  area('projects', round1(projectScore),
    [{ code: 'projectsCompleted', value: summaries.filter((p) => p.status === 'completed').length, target: summaries.length },
     { code: 'tasksCompleted', value: summaries.reduce((s, p) => s + p.completedTasks, 0), target: summaries.reduce((s, p) => s + p.totalTasks, 0) }],
    nextProject ? projectStep('continueProject', nextProject) : { code: 'polishPortfolio', params: null });

  // 4. Features in the API and full-stack projects, including change requests.
  const featureProjects = summaries.filter((p) => p.order === 2 || p.order === 4);
  const featureTotal = featureProjects.reduce((s, p) => s + p.totalTasks, 0);
  const featureDone = featureProjects.reduce((s, p) => s + p.completedTasks, 0);
  const crTotal = input.allProjectTasks.filter((t) => t.isChangeRequest).length;
  const crDone = summaries.reduce((s, p) => s + p.changeRequestsDone, 0);
  const nextFeature = featureProjects.find((p) => p.status !== 'completed');
  area('features', pct(featureDone + crDone, featureTotal + crTotal),
    [{ code: 'featureTasksDone', value: featureDone, target: featureTotal }, { code: 'changeRequestsDone', value: crDone, target: crTotal }],
    nextFeature ? projectStep('continueProject', nextFeature) : { code: 'tryChangeRequests', params: null });

  // 5. Tests: project tasks about testing, plus testing topics.
  const testingIds = new Set(state.topics.filter((t) => t.skill === 'Testing').map((t) => t.id));
  const testTasks = input.allProjectTasks.filter((t) => t.linkedTopicIds.some((id) => testingIds.has(id)));
  const testTasksDone = testTasks.filter((t) => t.done).length;
  const testTopicsDone = state.topics.filter((t) => t.skill === 'Testing' && t.isDone).length;
  const testScore = 0.6 * pct(testTasksDone, testTasks.length) + 0.4 * pct(testTopicsDone, testingIds.size);
  const nextTesting = state.topics.find((t) => t.skill === 'Testing' && !t.isDone);
  area('testing', round1(testScore),
    [{ code: 'testTasksDone', value: testTasksDone, target: testTasks.length }, { code: 'testTopicsDone', value: testTopicsDone, target: testingIds.size }],
    nextTesting ? topicStep('studyTopic', nextTesting) : { code: 'writeMoreTests', params: null });

  // 6. Debugging and problem solving.
  const debugTypes: M.ExerciseType[] = ['Debugging', 'Scenario', 'CodeReview'];
  const debug = input.exercises.filter((e) => debugTypes.includes(e.type));
  area('debugging', pct(debug.filter((d) => d.done).length, debug.length),
    debugTypes.map((t) => ({
      code: `${t.charAt(0).toLowerCase()}${t.slice(1)}Done`,
      value: debug.filter((d) => d.type === t && d.done).length,
      target: debug.filter((d) => d.type === t).length,
    })),
    { code: 'practiceDebugging', params: null });

  // 7. Interview practice: confident = 1 point, partial = 0.5.
  const points = input.ratings.reduce<number>((s, r) => s + (r === 'Confident' ? 1 : r === 'Partial' ? 0.5 : 0), 0);
  area('interview', pct(points, input.ratings.length),
    [{ code: 'questionsConfident', value: input.ratings.filter((r) => r === 'Confident').length, target: input.ratings.length },
     { code: 'questionsPracticed', value: input.ratings.filter((r) => r !== null).length, target: input.ratings.length }],
    { code: 'practiceInterview', params: null });

  // 8. Portfolio checklist.
  const checksDone = input.portfolioChecks.length;
  const portfolioTotal = input.checklist.length * summaries.length;
  area('portfolio', pct(checksDone, portfolioTotal),
    [{ code: 'portfolioItemsDone', value: checksDone, target: portfolioTotal }],
    { code: 'completeChecklist', params: null });

  const portfolio: M.CareerReadiness['portfolio'] = summaries.map((p) => ({
    projectId: p.id, slug: p.slug, titleEn: p.titleEn, titleAr: p.titleAr,
    items: input.checklist.map((i) => ({
      id: i.id, key: i.key, titleEn: i.titleEn, titleAr: i.titleAr, descriptionEn: i.descriptionEn, descriptionAr: i.descriptionAr,
      isDone: input.portfolioChecks.some((c) => c.projectId === p.id && c.checklistItemId === i.id),
    })),
  }));

  const topGaps = [...areas].sort((a, b) => a.score - b.score).filter((a) => a.score < 50).slice(0, 3).map((a) => a.key);
  return { areas, topGaps, portfolio };
}

// ---------- Streaks ----------

/** Consecutive days with at least one session, ending today (or yesterday if today has none yet). */
export function streak(days: Set<string>, today: string): number {
  let day = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(day)) { count++; day = addDays(day, -1); }
  return count;
}

// ---------- Achievements ----------

export function achievements(state: LearningState, totalMinutes: number, milestones: { en: string; ar: string; projectEn: string; projectAr: string; tasks: { status: M.ProjectTaskStatus; completedAt: string | null; isChangeRequest: boolean }[] }[], practiceDates: string[]): M.Achievement[] {
  const list: M.Achievement[] = [];
  const done = state.topics.filter((t) => t.isDone && t.completedAt !== null).sort((a, b) => (a.completedAt! < b.completedAt! ? -1 : 1));

  for (const n of [1, 10, 25, 50, 100]) {
    if (done.length >= n) list.push({ code: 'topicsDone', params: { count: String(n) }, at: done[n - 1].completedAt });
  }
  for (const phase of state.phases) {
    const topics = state.topics.filter((t) => t.phaseId === phase.id);
    if (topics.length > 0 && topics.every((t) => t.isDone)) {
      const dates = topics.map((t) => t.completedAt).filter((d): d is string => d !== null).sort();
      list.push({ code: 'phaseDone', params: { en: phase.title_en, ar: phase.title_ar }, at: dates[dates.length - 1] ?? null });
    }
  }
  for (const m of milestones) {
    const core = m.tasks.filter((t) => !t.isChangeRequest);
    if (core.length > 0 && core.every((t) => t.status === 'Completed')) {
      const dates = m.tasks.map((t) => t.completedAt).filter((d): d is string => d !== null).sort();
      list.push({ code: 'milestoneDone', params: { en: m.en, ar: m.ar, projectEn: m.projectEn, projectAr: m.projectAr }, at: dates[dates.length - 1] ?? null });
    }
  }
  const sortedPractice = [...practiceDates].sort();
  for (const n of [1, 5, 10, 25]) {
    if (sortedPractice.length >= n) list.push({ code: 'exercisesDone', params: { count: String(n) }, at: sortedPractice[n - 1] });
  }
  for (const hours of [5, 10, 25, 50, 100]) {
    if (totalMinutes >= hours * 60) list.push({ code: 'studyHours', params: { hours: String(hours) }, at: null });
  }
  return list
    .sort((a, b) => (b.at ?? '￿').localeCompare(a.at ?? '￿'))
    .slice(0, 12);
}

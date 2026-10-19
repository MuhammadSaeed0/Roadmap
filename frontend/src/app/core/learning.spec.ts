import { describe, expect, it } from 'vitest';
import * as L from './learning';
import * as M from './models';

// A small roadmap: two phases, a prerequisite chain, and one in-progress topic.
const phases: L.PhaseRow[] = [
  { id: 1, slug: 'p1', sort_order: 1, title_en: 'Phase 1', title_ar: 'م1', description_en: '', description_ar: '' },
  { id: 2, slug: 'p2', sort_order: 2, title_en: 'Phase 2', title_ar: 'م2', description_en: '', description_ar: '' },
];
const topic = (id: number, phase: number, order: number, skill: M.SkillArea, priority: M.TopicPriority, minutes = 30) => ({
  id, slug: `t${id}`, phase_id: phase, sort_order: order, skill, priority, estimated_minutes: minutes,
  title_en: `Topic ${id}`, title_ar: `موضوع ${id}`,
});
const topics = [
  topic(1, 1, 1, 'CSharp', 'Core'),
  topic(2, 1, 2, 'SqlServer', 'Important'),
  topic(3, 1, 3, 'CSharp', 'Optional', 90),
  topic(4, 2, 1, 'Angular', 'Core'),
];
const prereqs = [{ topic_id: 4, prerequisite_topic_id: 1 }];

type ProgressInput = [number, M.TopicStatus, M.KnowledgeLevel?, (number | null)?];

function state(progress: ProgressInput[] = []) {
  const map = new Map(progress.map(([id, status, knowledge = 'Unassessed', confidence = null]) => [
    id, { status, knowledge, confidence, completed_at: status === 'Completed' ? '2026-10-01T10:00:00+00:00' : null },
  ]));
  return L.buildState(phases, topics, prereqs, map);
}

describe('progress', () => {
  it('weights topics by skill and priority, so SQL Server counts less than C#', () => {
    // Weights: topic 1 = 1*3, topic 2 = 0.4*2, topic 3 = 1*1, topic 4 = 1*3. Total 7.8.
    // Only topic 1 is done, so 3 / 7.8 = 38.5%.
    const s = state([[1, 'Completed']]);
    expect(L.weightedPercent(s.topics)).toBe(38.5);
  });

  it('counts Skipped as done', () => {
    expect(state([[1, 'Skipped']]).byId.get(1)!.isDone).toBe(true);
  });

  it('points at the first phase with an unfinished Core topic', () => {
    expect(L.currentPhase(state())!.id).toBe(1);
    expect(L.currentPhase(state([[1, 'Completed']]))!.id).toBe(2);
  });

  it('puts topics with low confidence into weak areas', () => {
    const weak = L.weakAreas(state([[1, 'Completed', 'Unassessed', 1]]));
    expect(weak.map((w) => w.reason)).toEqual(['completedLowConfidence']);
  });
});

describe('recommendations', () => {
  const none = { projectNeeds: new Map(), allowSkippingPrerequisites: false, focusSkill: null, availableMinutes: null };

  it('hides topics whose prerequisites are not done', () => {
    const ids = L.rankTopics(state(), none).map((r) => r.topic.id);
    expect(ids).not.toContain(4);
  });

  it('shows the blocked topic with a penalty when skipping prerequisites is allowed', () => {
    const ranked = L.rankTopics(state(), { ...none, allowSkippingPrerequisites: true });
    const blocked = ranked.find((r) => r.topic.id === 4)!;
    expect(blocked.reasons.map((r) => r.code)).toContain('prerequisitesSkipped');
    expect(blocked.reasons.map((r) => r.code)).not.toContain('!prerequisitesSkipped');
  });

  it('ranks an in-progress topic first', () => {
    const ranked = L.rankTopics(state([[2, 'InProgress']]), none);
    expect(ranked[0].topic.id).toBe(2);
    expect(ranked[0].reasons.map((r) => r.code)).toContain('inProgress');
  });

  it('adds the focus skill bonus', () => {
    const plain = L.rankTopics(state(), none).find((r) => r.topic.id === 3)!.score;
    const focused = L.rankTopics(state(), { ...none, focusSkill: 'CSharp' }).find((r) => r.topic.id === 3)!.score;
    expect(focused - plain).toBe(15);
  });
});

describe('spaced review', () => {
  it('maps confidence to the interval table, clamped to 0..5', () => {
    expect([0, 1, 2, 3, 4, 5].map((c) => L.reviewIntervalDays(c))).toEqual([1, 1, 2, 4, 8, 16]);
    expect(L.reviewIntervalDays(null)).toBe(1);
    expect(L.reviewIntervalDays(9)).toBe(16);
  });
});

describe('study plan', () => {
  it.each([30, 60, 120])('splits %i minutes into activities that add up exactly', (minutes) => {
    const total = L.planDurations(minutes).reduce((sum, d) => sum + d.minutes, 0);
    expect(total).toBe(minutes);
  });

  it('uses the short template for 30 minutes', () => {
    expect(L.planDurations(30).map((d) => d.kind)).toEqual(['learn', 'practice', 'interview']);
  });

  it('merges back-to-back items for the same topic', () => {
    const item = (minutes: number): M.StudyPlanItem => ({
      kind: 'learn', minutes, titleEn: 'a', titleAr: 'a', topicId: 1, exerciseId: null, projectId: null, projectTaskId: null, interviewCategory: null,
    });
    expect(L.mergeConsecutive([item(10), item(15)])).toEqual([item(25)]);
  });
});

describe('dates and streaks', () => {
  it('adds days across month and year boundaries', () => {
    expect(L.addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(L.addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('finds the first day of a week that starts on the given day', () => {
    // 2026-10-19 is a Monday.
    expect(L.weekStart('2026-10-19', 'Monday')).toBe('2026-10-19');
    expect(L.weekStart('2026-10-19', 'Sunday')).toBe('2026-10-18');
    expect(L.weekStart('2026-10-19', 'Saturday')).toBe('2026-10-17');
  });

  it('counts a streak that is still alive from yesterday', () => {
    const days = new Set(['2026-10-17', '2026-10-18']);
    expect(L.streak(days, '2026-10-19')).toBe(2);
    expect(L.streak(new Set(['2026-10-19']), '2026-10-19')).toBe(1);
  });
});

describe('projects', () => {
  const project = (tasks: { id: number; status: M.ProjectTaskStatus; cr?: boolean; unlock?: number }[]): L.ProjectView => ({
    row: { id: 1, slug: 'p', sort_order: 1, title_en: 'P', title_ar: 'P', summary_en: '', summary_ar: '', requirements_en: '', requirements_ar: '', tech_stack: 'C#', start_after_phase_id: 1 },
    milestones: [{
      row: { id: 10, key: 'm', project_id: 1, sort_order: 1, title_en: 'M', title_ar: 'M', description_en: '', description_ar: '' },
      tasks: tasks.map((t) => ({
        row: {
          id: t.id, key: `k${t.id}`, milestone_id: 10, sort_order: t.id, title_en: 'T', title_ar: 'T', description_en: '', description_ar: '',
          acceptance_criteria_en: '', acceptance_criteria_ar: '', estimated_minutes: 30, priority: 'High',
          is_change_request: t.cr ?? false, unlock_at_percent: t.unlock ?? 0,
        },
        status: t.status, blockedReason: null, completedAt: null, topicIds: [],
      })),
    }],
    portfolioDone: new Set(),
    repositoryUrl: null,
  });

  it('is active once a task has started, and completed at 100% of core tasks', () => {
    expect(L.summarizeProject(project([{ id: 1, status: 'InProgress' }, { id: 2, status: 'NotStarted' }]), phases, 0).summary.status).toBe('active');
    expect(L.summarizeProject(project([{ id: 1, status: 'Completed' }, { id: 2, status: 'Completed' }]), phases, 0).summary.status).toBe('completed');
  });

  it('keeps change requests out of the completion percentage', () => {
    const calc = L.summarizeProject(project([{ id: 1, status: 'Completed' }, { id: 2, status: 'NotStarted', cr: true, unlock: 50 }]), phases, 0);
    expect(calc.percent).toBe(100);
    expect(calc.summary.changeRequestsUnlocked).toBe(1);
  });
});

describe('career readiness', () => {
  it('reports the eight areas, with the lowest scores as top gaps', () => {
    const readiness = L.careerReadiness({
      state: state(),
      summaries: [],
      allProjectTasks: [],
      exercises: [],
      ratings: [],
      checklist: [],
      portfolioChecks: [],
    });
    expect(readiness.areas.map((a) => a.key)).toEqual(['coreTopics', 'confidence', 'projects', 'features', 'testing', 'debugging', 'interview', 'portfolio']);
    expect(readiness.topGaps.length).toBeLessThanOrEqual(3);
  });
});

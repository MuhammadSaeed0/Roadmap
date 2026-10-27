// TypeScript mirrors of the API's C# DTOs (JSON is camelCase, enums are strings).
// Every translatable field arrives as an En/Ar pair; the `loc` pipe picks one.

export type SkillArea =
  | 'CSharp' | 'AspNetCore' | 'EfCore' | 'SqlServer' | 'TypeScript'
  | 'Angular' | 'FullStack' | 'Testing' | 'Git' | 'Professional';
export type TopicPriority = 'Core' | 'Important' | 'Optional';
export type TopicStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Skipped';
export type KnowledgeLevel = 'Unassessed' | 'AlreadyKnow' | 'NeedReview' | 'NeedToLearn';
export type ProjectTaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Blocked';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type ResourceType = 'Documentation' | 'Tutorial' | 'Course' | 'Video' | 'Article' | 'Reference' | 'Tool';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type VerificationStatus = 'Unverified' | 'Verified' | 'Broken';
export type ExerciseType = 'Coding' | 'Debugging' | 'Scenario' | 'CodeReview';
export type PracticeStatus = 'NotStarted' | 'Attempted' | 'Completed';
export type InterviewCategory =
  | 'CSharp' | 'DotNet' | 'AspNetCore' | 'EfCore' | 'SqlServer' | 'TypeScript'
  | 'Angular' | 'RestApi' | 'Testing' | 'Git' | 'FullStackDesign';
export type InterviewRating = 'NeedReview' | 'Partial' | 'Confident';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const SKILLS: SkillArea[] = ['CSharp', 'AspNetCore', 'EfCore', 'SqlServer', 'TypeScript', 'Angular', 'FullStack', 'Testing', 'Git', 'Professional'];
export const INTERVIEW_CATEGORIES: InterviewCategory[] = ['CSharp', 'DotNet', 'AspNetCore', 'EfCore', 'SqlServer', 'TypeScript', 'Angular', 'RestApi', 'Testing', 'Git', 'FullStackDesign'];
export const EXERCISE_TYPES: ExerciseType[] = ['Coding', 'Debugging', 'Scenario', 'CodeReview'];

export interface PagedResult<T> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number; }

export interface TopicRef { id: number; slug: string; titleEn: string; titleAr: string; skill: SkillArea; status: TopicStatus; }
export interface PhaseRef { id: number; slug: string; order: number; titleEn: string; titleAr: string; }

export interface TopicSummary {
  id: number; slug: string; phaseId: number; order: number; skill: SkillArea; priority: TopicPriority;
  estimatedMinutes: number; titleEn: string; titleAr: string; summaryEn: string; summaryAr: string;
  status: TopicStatus; knowledge: KnowledgeLevel; confidence: number | null; inReview: boolean; prerequisitesMet: boolean;
}

export interface ProjectBrief { id: number; slug: string; titleEn: string; titleAr: string; techStack: string; percent: number; }

export interface Phase {
  id: number; slug: string; order: number; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string;
  topicCount: number; doneCount: number; percent: number; remainingMinutes: number;
  topics: TopicSummary[]; projects: ProjectBrief[];
}
export interface Roadmap { phases: Phase[]; currentPhaseId: number | null; }

export interface Resource {
  id: number; key: string; titleEn: string; titleAr: string | null; url: string; sourceName: string;
  type: ResourceType; difficulty: Difficulty; isFree: boolean; verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null; lastStatusCode: number | null; topics: TopicRef[];
}

export interface StudySession {
  id: number; topicId: number | null; topicTitleEn: string | null; topicTitleAr: string | null;
  projectTaskId: number | null; taskTitleEn: string | null; taskTitleAr: string | null;
  plannedMinutes: number | null; actualMinutes: number; sessionDate: string; note: string | null; createdAt: string;
}

export interface ReviewState { intervalDays: number; nextReviewOn: string; lastReviewedOn: string | null; reviewCount: number; isDue: boolean; }

export interface TopicDetail {
  id: number; slug: string; phase: PhaseRef; order: number; skill: SkillArea; priority: TopicPriority; estimatedMinutes: number;
  titleEn: string; titleAr: string; summaryEn: string; summaryAr: string; whyEn: string; whyAr: string;
  howEn: string; howAr: string; exampleEn: string; exampleAr: string; codeSample: string | null; codeLanguage: string | null;
  practiceTaskEn: string; practiceTaskAr: string; challengeEn: string; challengeAr: string;
  status: TopicStatus; knowledge: KnowledgeLevel; confidence: number | null; completedAt: string | null;
  prerequisitesMet: boolean; prerequisites: TopicRef[]; unlocks: TopicRef[]; samePhase: TopicRef[];
  resources: Resource[];
  projects: { projectId: number; slug: string; titleEn: string; titleAr: string; taskCount: number }[];
  interviewQuestions: { id: number; questionEn: string; questionAr: string; difficulty: Difficulty; rating: InterviewRating | null }[];
  exercises: { id: number; type: ExerciseType; titleEn: string; titleAr: string; difficulty: Difficulty; status: PracticeStatus }[];
  sessions: StudySession[]; totalMinutesStudied: number; noteCount: number; review: ReviewState | null;
}

export interface TopicProgressUpdate { status: TopicStatus; knowledge: KnowledgeLevel; confidence: number | null; }

export interface Reason { code: string; params: Record<string, string> | null; }
export interface Recommendation { topic: TopicSummary; phase: PhaseRef; score: number; reasons: Reason[]; }

export type PlanKind = 'learn' | 'practice' | 'exercise' | 'challenge' | 'review' | 'project' | 'interview';
export interface StudyPlanItem {
  kind: PlanKind; minutes: number; titleEn: string; titleAr: string;
  topicId: number | null; exerciseId: number | null; projectId: number | null; projectTaskId: number | null;
  interviewCategory: InterviewCategory | null;
}
export interface StudyPlan { minutes: number; items: StudyPlanItem[]; }

export interface ProjectSummary {
  id: number; slug: string; order: number; titleEn: string; titleAr: string; summaryEn: string; summaryAr: string;
  techStack: string; startAfterPhase: PhaseRef; totalTasks: number; completedTasks: number; inProgressTasks: number;
  blockedTasks: number; percent: number; status: 'notStarted' | 'active' | 'completed';
  currentMilestoneEn: string | null; currentMilestoneAr: string | null;
  changeRequestsUnlocked: number; changeRequestsDone: number; portfolioDone: number; portfolioTotal: number;
}

export interface ProjectTask {
  id: number; key: string; milestoneId: number; order: number; titleEn: string; titleAr: string;
  descriptionEn: string; descriptionAr: string; criteriaEn: string[]; criteriaAr: string[];
  estimatedMinutes: number; priority: TaskPriority; isChangeRequest: boolean; unlockAtPercent: number; isLocked: boolean;
  status: ProjectTaskStatus; blockedReason: string | null; completedAt: string | null; topics: TopicRef[];
}
export interface Milestone {
  id: number; order: number; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string;
  totalTasks: number; completedTasks: number; tasks: ProjectTask[];
}
export interface PortfolioItem { id: number; key: string; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string; isDone: boolean; }
export interface ProjectDetail {
  summary: ProjectSummary; requirementsEn: string[]; requirementsAr: string[]; repositoryUrl: string | null;
  milestones: Milestone[]; changeRequests: ProjectTask[]; portfolio: PortfolioItem[]; noteCount: number;
}

export interface ExerciseSummary {
  id: number; key: string; type: ExerciseType; topicId: number; topicTitleEn: string; topicTitleAr: string;
  difficulty: Difficulty; estimatedMinutes: number; titleEn: string; titleAr: string; status: PracticeStatus;
}
export interface PracticeTypeStats { type: ExerciseType; total: number; completed: number; attempted: number; }
export interface PracticeOverview { exercises: ExerciseSummary[]; stats: PracticeTypeStats[]; }
export interface ExerciseDetail {
  summary: ExerciseSummary; problemEn: string; problemAr: string; code: string | null; codeLanguage: string | null;
  expectedOutcomeEn: string; expectedOutcomeAr: string; hintCount: number;
  revealedHintsEn: string[]; revealedHintsAr: string[]; userAnswer: string | null; solutionRevealed: boolean;
  solutionEn: string | null; solutionAr: string | null; solutionCode: string | null; completedAt: string | null;
}

export interface InterviewQuestion {
  id: number; key: string; category: InterviewCategory; topicId: number; topicTitleEn: string; topicTitleAr: string;
  difficulty: Difficulty; questionEn: string; questionAr: string; answerEn: string; answerAr: string;
  exampleCode: string | null; followUpEn: string | null; followUpAr: string | null;
  rating: InterviewRating | null; timesPracticed: number; lastPracticedAt: string | null;
}
export interface InterviewCategoryStats { category: InterviewCategory; total: number; confident: number; partial: number; needReview: number; }
export interface InterviewList { questions: InterviewQuestion[]; categories: InterviewCategoryStats[]; }

export type NoteLinkType = 'topic' | 'project' | 'task' | 'question';
export interface Note {
  id: number; title: string; content: string; linkType: NoteLinkType | null; linkId: number | null;
  linkTitleEn: string | null; linkTitleAr: string | null; linkParentId: number | null; createdAt: string; updatedAt: string;
}
export interface NoteRequest {
  title: string; content: string; topicId: number | null; projectId: number | null;
  projectTaskId: number | null; interviewQuestionId: number | null;
}

export interface ReviewItem {
  topicId: number; slug: string; titleEn: string; titleAr: string; skill: SkillArea; confidence: number | null;
  intervalDays: number; nextReviewOn: string; lastReviewedOn: string | null; reviewCount: number; daysOverdue: number;
}
export interface ReviewQueue { due: ReviewItem[]; upcoming: ReviewItem[]; suggested: TopicRef[]; rules: { confidence: number; days: number }[]; }

export interface Preferences { dailyGoalMinutes: number; allowSkippingPrerequisites: boolean; focusSkill: SkillArea | null; weekStartsOn: DayOfWeek; }

export interface OverallProgress { percent: number; doneTopics: number; remainingTopics: number; totalTopics: number; remainingMinutes: number; currentPhase: PhaseRef | null; }
export interface SkillProgress { skill: SkillArea; percent: number; done: number; total: number; averageConfidence: number | null; weight: number; }
export interface Activity { kind: string; titleEn: string; titleAr: string; at: string; entityId: number | null; parentId: number | null; minutes: number | null; }

export interface Dashboard {
  overall: OverallProgress; recommendation: Recommendation | null; projects: ProjectSummary[]; skills: SkillProgress[];
  recentActivity: Activity[]; reviewsDue: number; minutesThisWeek: number; streakDays: number;
  dailyGoalMinutes: number; minutesToday: number;
}

export interface WeakTopic { topic: TopicRef; confidence: number | null; reason: string; }
export interface Achievement { code: string; params: Record<string, string>; at: string | null; }
export interface ProgressReport {
  overall: OverallProgress;
  formula: { skillWeights: Record<SkillArea, number>; priorityWeights: Record<TopicPriority, number> };
  skills: SkillProgress[];
  phases: { id: number; order: number; titleEn: string; titleAr: string; percent: number; done: number; total: number }[];
  confidence: { level: string; count: number }[];
  projects: ProjectSummary[]; practice: PracticeTypeStats[];
  interview: { total: number; confident: number; partial: number; needReview: number; notPracticed: number };
  weeklyStudy: { weekStart: string; minutes: number }[];
  achievements: Achievement[]; weakAreas: WeakTopic[]; totalMinutesStudied: number;
}

export interface WeeklyReview {
  weekStart: string; weekEnd: string; topicsCompleted: TopicRef[]; minutesStudied: number; previousWeekMinutes: number;
  sessionCount: number;
  tasksCompleted: { id: number; projectId: number; titleEn: string; titleAr: string; projectTitleEn: string; projectTitleAr: string }[];
  exercisesCompleted: number; questionsPracticed: number; weakTopics: WeakTopic[]; suggestions: Reason[];
  days: { date: string; minutes: number }[];
}

export interface ReadinessArea { key: string; score: number; level: 'gap' | 'developing' | 'solid' | 'strong'; evidence: { code: string; value: number; target: number }[]; nextStep: Reason; }
export interface CareerReadiness {
  areas: ReadinessArea[]; topGaps: string[];
  portfolio: { projectId: number; slug: string; titleEn: string; titleAr: string; items: PortfolioItem[] }[];
}

export interface SearchHit { id: number; titleEn: string; titleAr: string; subtitleEn: string | null; subtitleAr: string | null; parentId: number | null; url: string | null; }
export type SearchCategory = 'topics' | 'projects' | 'tasks' | 'practice' | 'interview' | 'resources' | 'notes';
export interface SearchResult { query: string; groups: { category: SearchCategory; items: SearchHit[] }[]; }

export interface LinkCheckResult { checked: number; verified: number; broken: number; unreachable: number; checkedAt: string; }

/** 'ok', or why suggestions couldn't be refreshed (cached ones may still be listed). */
export type VideoSuggestionStatus = 'ok' | 'not_configured' | 'quota_exceeded' | 'unavailable';
export interface TopicVideo {
  videoId: string; title: string; channelTitle: string; publishedAt: string | null; durationSeconds: number | null;
  /** 'suggested' comes from the shared YouTube search; 'added' was added by this user from a link. */
  source: 'suggested' | 'added'; addedId: number | null;
  isWatched: boolean; isBookmarked: boolean;
}
export interface TopicVideos { status: VideoSuggestionStatus; searchQuery: string; videos: TopicVideo[]; }

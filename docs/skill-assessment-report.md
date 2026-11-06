# Developer level and skill assessment: implementation report

**Branch:** `feature/skill-level-assessment`

**Request:** the pasted "Senior Software Architect & Developer Skill Assessment System Engineer" prompt.
It asks for a points system, a developer level from Fresh to Expert, a skill profile, a dashboard,
project evaluation, anti-gaming rules and adaptive assessments.

## What was built

A new page, **Developer Level** (`/skills`), answers the prompt's seven questions:

| Question in the prompt | Where it is answered |
|---|---|
| What is my current developer level? | The level card: the level, the overall competency (0–100), XP, and the progress to the next level |
| How good am I at each technology? | The competency breakdown (14 areas) and the skill profile table (one row per roadmap technology) |
| What skills am I weak at? | Weaknesses: areas below 40, and topics where most quiz answers were wrong |
| What have I actually demonstrated? | Every point carries a verification tier; the card splits verified XP from self-reported XP; the points history lists each change |
| What separates me from the next level? | "What you need for {level}": each unmet requirement, its current value against the target, and links to the quizzes, exercises and project tasks that close it |
| What should I learn or build next? | The same links, plus "Skill checks for you", which picks a check at the right difficulty for each area |
| Am I progressing toward Senior? | The level ladder, the level history, and the warning shown when XP is ahead of the demonstrated skills |

The project page also gets a **Project review** card. The learner scores a finished project from 0 to 4 on each of 10
criteria: architecture, code quality, functionality, database, API, front end, security, testing, performance and
deployment.

## Architecture found (Phase 1)

- **Content.** The content is seeded from `backend/DevPath.Api/SeedData`:
  - 166 topics in 14 phases;
  - 648 quiz questions, in three levels per topic;
  - 143 practice exercises, typed and graded by difficulty;
  - 855 interview questions;
  - 4 projects with 77 tasks, including change requests;
  - curated videos.
- **Progress.** Progress lives in per-user tables, each with a query filter:
  - `TopicProgress`, `QuizAttempt`, `VideoProgress`, `PracticeProgress`;
  - `ProjectTaskProgress`, `ProjectRepository`, `PortfolioCheck`;
  - `InterviewProgress`, `StudySession`, `Note`.
- **Only quizzes are graded by the server.** Everything else is self-reported:
  - Topics, project tasks and videos are status toggles.
  - Exercise check scores are reported by the learner's browser.
  - Interview ratings are the learner's own.
- **Some data the scoring model needs did not exist:**
  - Quiz attempts stored only `Score`/`Total`, with no per-question answers.
  - Most topics (151 of 166) have no difficulty.
  - Project tasks have only `EstimatedMinutes` and `Priority`.
  - Notes attach to topics, not to videos.
- **An existing page overlaps.** `CareerReadinessService` already reports readiness areas, and deliberately avoids a
  single combined score.

## Design

**Points are derived from progress that already exists, and recorded in an append-only ledger.** No service had to
emit point events.

1. **`SkillAssessmentService` loads a snapshot of the learner's progress.**
2. **`SkillCalculator` scores the snapshot.** It is a pure function with no database access. For every item in the
   roadmap that can earn points, it returns:
   - the item's maximum worth;
   - what the learner has earned from it now;
   - its verification tier;
   - its evidence kind;
   - its competency categories.
3. **The service reconciles the ledger.** For each source, it compares the sum of the source's `XpTransaction` rows
   with the source's current worth, and appends one row with the difference.
   - Running it twice writes nothing the second time.
   - A unique index on `(UserId, SourceKey, Seq)` makes two concurrent reconciles collide instead of double-counting.
   - Re-opening a task appends a negative row, so toggling can never inflate the total.
4. **Existing progress is credited the first time the page is opened.** The ledger rows carry the original completion
   time as `OccurredAt`. No progress row is changed.

All numbers are in `SeedData/skill-assessment.json`:
- the point tables;
- the verification factors;
- the evidence weights;
- the categories and how topics map to them;
- the level thresholds.

The API reads that file at start-up and refuses to start when it is inconsistent: an unknown category, thresholds that
don't increase, or a missing factor. `GET /api/skill-level/rules` shows the rules in force.

## Points (Phase 2)

| Prompt item | Points | How it is implemented |
|---|---:|---|
| Watch a video | 2 | `VideoProgress.IsWatched`. At most 3 videos per topic count; more videos of the same topic earn nothing |
| Video with notes | 5 | The video is watched and the learner has a note of 80+ characters on its topic. There is no per-video note in the app |
| Video and passed assessment | 10 | The video is watched and level 1 of the topic's quiz is passed |
| Easy / Medium / Hard / Advanced question | 5 / 10 / 20 / 30 | Each question earns once, on its first correct answer. Its difficulty comes from its topic's difficulty, see below |
| Passing quiz level 2 / 3 | 10 / 30 | Reviews that mix the topic with earlier ones show retention. Not in the prompt; added so the review levels count |
| Learning task: very easy / easy / medium / hard / advanced | 5 / 10 / 20 / 35 / 50 | Completing a topic. Its difficulty comes from the topic, and Beginner + Optional counts as very easy |
| Exercise: basic / intermediate / advanced / complex | 20 / 40 / 70 / 100 | `PracticeExercise.Difficulty`; Expert, and Advanced challenges or mini-projects, count as complex |
| Small / medium / complex project task | 20 / 40 / 75 | By estimated time: up to 40 minutes, up to 60 minutes, or longer |
| Whole small / medium / advanced project | 100 / 250 / 500 | Paid only when every required task is done. Change requests are optional and not required. The sizes per project are in the rules file |
| Interview question rated confident / partial | 5–30 / half | By the question's difficulty; self-rated, so self-reported |
| Project review | 50 / 100 / 150 per project | Spread over the 10 criteria, scaled by the 0–4 score; counts only once the project is finished |
| Portfolio checklist item | 5 | Per item ticked per project |

**Difficulty where the content has none.** The quiz question and learning-task difficulty use the topic's own
difficulty when it is set. When it isn't, they use the phase difficulty in `phaseDifficulty`:
- **Beginner:** C# fundamentals, OOP, TypeScript and Git;
- **Advanced:** Professional skills and Cloud & DevOps;
- **Intermediate:** everything else.

**Verification tiers.** Each award is multiplied by its tier's factor:

| Tier | Factor | Used for |
|---|---:|---|
| Self-reported | 0.5 | A ticked topic with no passed quiz, a project task with no repository link, an exercise marked complete with no attempt, an interview rating |
| Evidenced | 0.75 | A project with a repository link, an exercise with a written answer or every acceptance criterion ticked |
| Auto-checked | 0.9 | An exercise whose automatic checks all passed (the browser reports this, so it is not 1.0) |
| Quiz-verified | 1.0 | Quiz answers and passed levels, and topics whose level 1 quiz is passed |
| Reviewed | 1.0 | Reserved for an outside reviewer. There is no reviewer workflow yet |

**Exercises** lose 10% per hint revealed, up to 30%, and half when the model solution was revealed. A separate quality
award (20% of the exercise) needs the exercise solved without the solution and meeting its criteria or checks.

## Level calculation (Phase 3)

**Category scores.** Each of the 14 competency categories gets a score from 0 to 100:
1. For each evidence kind, compute the share of the available points the learner has earned. The kinds are passive,
   knowledge, practical, project and quality.
2. Combine the shares with the evidence weights from the prompt: 5 / 20 / 25 / 40 / 10.

A kind the category has no content for, such as projects for Git, doesn't count against it: its weight moves to the
other kinds.

**Overall competency.** The overall score is the weighted mean of the category scores. Projects weigh the most (12),
and Git the least (4).

**Category mapping.** Topics map to categories in this order:
1. an explicit slug, for example `pro-security`, `api-authentication` and `sql-injection` go to Security;
2. a slug prefix, for example `arch-` to Architecture and `ef-` to EF Core;
3. the topic's phase.

Other sources map as follows:
- **Exercises:** they also count toward Problem solving (debugging, scenarios, challenges), toward Architecture (code
  reviews), and toward the categories of the technologies they combine.
- **Project tasks:** they count toward Real-world projects and toward the categories of the topics they are linked to.

**A level is reached only when all of its requirements are met, and every level below it is met too.** Each level
requires:
- its XP;
- its overall score;
- a minimum score in each listed category;
- for the higher levels, a number of projects or project tasks.

Because each category has its own minimum, points from one area can't make up for a gap in another. When the XP alone
would give a higher level than the competencies support, the page says so.

| Level | XP | Overall | Main category minimums | Projects |
|---|---:|---:|---|---|
| Fresh / Beginner | 0 | 0 | none | none |
| Junior | 500 | 10 | fundamentals 35, C# 15 | 5 project tasks |
| Mid-Level | 2,000 | 28 | fundamentals 55, C# 40, .NET 35, SQL 35, EF Core 30, APIs 30, Git 30, front end 25, testing 15, projects 30 | 1 project |
| Senior | 6,000 | 50 | C# and .NET 55, SQL/EF/APIs 50, architecture, testing and security 45, front end and problem solving 40, DevOps 30, projects 50 | 3 projects, including the advanced one |
| Expert | 12,000 | 70 | 70 in the core areas, 65 in testing, security, problem solving and projects, 60 in front end, 50 in DevOps | all 4 projects |

**Calibration.** An automated test gives one learner all the real content, done well:
- every topic, quiz level and exercise;
- every project task, with repository links;
- full reviews.

That learner reaches about 75 overall. Self-reported work keeps its lower factor even with evidence, so 100 is not
reachable without an outside reviewer. The Expert minimums are set just under this ceiling. The same test, with only
the boxes ticked (no quizzes, no evidence), stays a Beginner. Its XP alone would be a higher level, and the page shows
the warning.

## Anti-gaming (Phase 7)

| Requirement | How |
|---|---|
| Duplicate completion prevention | Each source key, for example `quiz-q:345` or `project-task:12`, is worth one amount; repeating the activity changes nothing |
| Video replay restrictions | A watched flag per video, and at most 3 counted videos per topic |
| Quiz attempt tracking | Every answer is now stored (`QuizAnswer`); attempts, accuracy and wrong tries before the first right answer are tracked. Three or more wrong tries reduce the question to 80% |
| Project task verification | Tasks are self-reported unless the project has a repository link; the completion bonus needs every required task |
| Score history | `XpTransaction`, with `GET /api/skill-level/history` and the points history on the page |
| Activity timestamps | `OccurredAt` (when the evidence happened) and `CreatedAt` (when it was recorded) on every row |
| Idempotent point transactions | Reconciling adds only differences; the unique index stops concurrent duplicates |
| Prevention of repeated rewards | As above; re-opening and re-completing a task writes +x, −x, +x, never +2x |
| Configurable point limits | At most 600 self-reported points count per day (`selfReportedDailyCap`) |
| Every modification recorded | Reversals are new rows; nothing in the ledger is updated or deleted |

## Automatic skill assessment (Phase 9)

Every category gets a band from its score:
- **Build foundations,** below 40: a level 1 quiz on the first topic not yet passed, and a beginner or intermediate
  exercise.
- **Consolidate,** from 40 to 70: a level 2 quiz and an intermediate or advanced exercise. Debugging exercises and
  scenarios are preferred.
- **Stretch,** 70 and above: a level 3 quiz and an advanced or expert challenge.

A category whose last quiz evidence is older than 90 days is marked **Re-check**. Each check is labelled by its type:
- a debugging challenge;
- an architecture scenario;
- a code review;
- an implementation task;
- a database exercise, through the SQL exercises of the database category.

**The checks reuse existing content.** No new questions were generated, because new assessment content would need
expert review before it could be used to grade anyone.

## Database and API (Phase 8)

**Migration:** `20261106220602_AddDeveloperLevel` adds four tables. It doesn't change any existing table.

| Prompt's suggested entity | Implemented as |
|---|---|
| `XPTransaction` | `XpTransactions` (the ledger) |
| `LearningActivityCompletion` | The existing progress tables. They already are the completion records, so no duplicate was made |
| `SkillAssessment` | `QuizAnswers` (per-question answers) + the existing `QuizAttempts` |
| `ProjectAssessment` | `ProjectAssessments` (rubric scores per user and project) |
| `DeveloperLevel`, `LevelRequirement`, `SkillCategory` | `SeedData/skill-assessment.json`, configuration rather than tables, like the rest of the content |
| `UserSkillProfile`, `SkillProficiency` | Computed on each request from the ledger's sources; not stored, so they can never disagree with progress |
| (level history) | `LevelChanges`, one row each time the level changes |

**Foreign keys.** `QuizAnswers` has no foreign key to `QuizQuestions`, because the seeder deletes questions that leave
the seed files. Answers to a deleted question are ignored. Its link to the account has no cascade, because SQL Server
allows only one cascade path: deleting an account removes its attempts, and the attempts remove their answers.

**Endpoints:**
- `GET /api/skill-level`
- `GET /api/skill-level/history?page=&pageSize=`
- `GET /api/skill-level/rules`
- `GET /api/projects/{id}/assessment`
- `PUT /api/projects/{id}/assessment`

Each one needs a signed-in, approved account, like the rest of the API.

## Tests (Phase 10)

| Suite | Before | After |
|---|---:|---:|
| Backend (xUnit) | 228 | 257 (29 new) |
| Frontend (Vitest) | 82 | 86 (4 new) |
| Frontend production build | succeeded | succeeded (budget note below) |

**`SkillCalculatorTests`, 19 tests.** They test the rules on hand-made progress:
- **Points and verification:**
  - a question earns once;
  - wrong answers earn nothing;
  - the retry penalty applies after repeated wrong tries;
  - question value follows difficulty;
  - old attempts aren't counted twice;
  - self-reported work earns less than quiz-verified work;
  - the video cap and the note and quiz upgrades;
  - exercise tiers, hints and solution penalties.
- **Projects:** the project bonus needs every required task; reviews count only for finished projects.
- **The daily cap.**
- **Category weighting and the overall weighting.**
- **Level transitions:**
  - a level capped by one missing requirement;
  - the next-level requirements and their links.
- **Weak topics.**
- **Adaptive checks, and stale evidence.**
- **The rules file itself.**

**`SkillLevelApiTests`, 10 tests.** They exercise the HTTP API:
- **A new learner** starts as a Beginner with every category.
- **The ledger:**
  - it is idempotent, so reading twice writes nothing;
  - reversals give +x, −x, +x.
- **Quizzes:**
  - a passed quiz upgrades the topic to quiz-verified;
  - retaking the quiz earns nothing more.
- **Existing progress** is credited on the first visit with its original timestamps, and is left unchanged.
- **Accounts** see only their own points.
- **The history** is paged.
- **Project review** validation:
  - an unknown criterion is rejected;
  - a score above 4 is rejected;
  - an unknown project gives 404.
- **The rules endpoint** returns the rules, and anonymous requests get 401.
- **Calibration:**
  - every real item done with evidence reaches Expert;
  - ticking boxes alone stays Beginner.

**`skill-level.page.spec.ts`, 4 tests.** They check that the page shows:
- the level, the competency warning and the next-level requirements, with links;
- the categories, weaknesses, checks, the technology profile and the history;
- every text in Arabic;
- the top-level state.

**Existing tests.** The existing suites run unchanged and pass, including the quiz tests now that each answer is stored.

## Conflicts with the prompt, and decisions

- **"Total points must not determine the level", next to the existing Career Readiness page.**
  - Career Readiness deliberately has no single score. It is kept as it was.
  - The developer level is a separate page.
  - The level is gated by category minimums, so it is not a single points total either.
- **Video completion "tracked accurately".**
  - The app only knows that the learner marked a video watched. There is no player progress tracking, so watching
    stays the lowest-value, capped evidence.
  - Tracking real watch time would need the YouTube player API in the video component.
- **Code quality, performance and best practices "where possible".**
  - Nothing runs the learner's code on the server, and repository links are not fetched or analysed.
  - Quality comes from:
    - acceptance criteria;
    - automatic checks run in the browser;
    - solving without the model solution;
    - the project review rubric.
  - Two of these sources are not trustworthy:
    - The browser's check scores can be forged by someone who calls the API directly. That is why auto-checked is
      0.9, not 1.0.
    - The rubric is self-assessed, so it counts as self-reported.
- **Verified reviews.** The "Reviewed" tier exists but nothing sets it yet. A reviewer workflow (for example, an
  administrator reviewing a learner's repository) is the natural next step, and the only way to reach 100.
- **Per-question difficulty.** The 648 questions have no difficulty of their own. Labelling them by hand was not done,
  so a question's difficulty is its topic's. The phase-difficulty table can be changed in the rules file.
- **Bundle budget.** The app loads both languages up front. The new page's texts pushed the initial bundle to 612 kB,
  past the 600 kB warning threshold. The warning threshold is now 650 kB; the 1 MB error limit is unchanged.

## How to change the rules

1. Edit `backend/DevPath.Api/SeedData/skill-assessment.json`.
2. Restart the API.

Run `SkillCalculatorTests` and `SkillLevelApiTests` after changing thresholds. The calibration test fails if Expert
becomes unreachable with full evidence, or reachable by ticking boxes alone.

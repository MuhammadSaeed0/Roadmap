# DevPath — Full-Stack Developer Academy

A bilingual (English / العربية) learning platform with private accounts for growing from SQL Server developer to **full-stack .NET + Angular developer**.
It combines a personalised roadmap, four practical projects, a practice lab, interview preparation, notes, spaced review, analytics and a career-readiness view, all running locally.

```text
Angular 22 + TypeScript   →   ASP.NET Core 10 Web API (C#)   →   EF Core 10   →   Local SQL Server (LocalDB)
        (port 4200)                    (port 5080)
```

| Dashboard (English, light) | Dashboard (Arabic, dark, RTL) |
|---|---|
| ![Dashboard in English](docs/screenshots/dashboard-en-light.png) | ![Dashboard in Arabic](docs/screenshots/dashboard-ar-dark.png) |

| Topic page | Practice Lab | Mobile menu (Arabic) |
|---|---|---|
| ![Topic](docs/screenshots/topic-en.png) | ![Practice](docs/screenshots/practice-en.png) | ![Mobile](docs/screenshots/mobile-ar-menu.png) |

---

## Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [SQL Server setup](#sql-server-setup)
5. [Project structure](#project-structure)
6. [Architecture and design decisions](#architecture-and-design-decisions)
7. [Data model](#data-model)
8. [API endpoints](#api-endpoints)
9. [Accounts and data privacy](#accounts-and-data-privacy)
10. [YouTube videos](#youtube-videos)
11. [Bilingual UI and right-to-left support](#bilingual-ui-and-right-to-left-support)
12. [How progress, recommendations and reviews are calculated](#how-progress-recommendations-and-reviews-are-calculated)
13. [Editing the learning content](#editing-the-learning-content)
14. [Tests](#tests)
15. [Troubleshooting](#troubleshooting)
16. [Known limitations](#known-limitations)
17. [Ideas for future improvements](#ideas-for-future-improvements)

---

## Features

- **Accounts**: sign-up, sign-in, sign-out, password reset and password change. Every account has its own private progress, notes, sessions, reviews, projects, practice answers, interview ratings, preferences and videos (see [Accounts and data privacy](#accounts-and-data-privacy)).
- **Videos on every topic**: relevant YouTube tutorials found automatically from the topic title and skill, plus your own videos added by link, with an in-page player and per-account "watched" and "saved" flags (see [YouTube videos](#youtube-videos)).
- **Dashboard**: weighted overall progress, completed and remaining topics, time remaining, current phase, a "continue learning" recommendation with its reasons, a 30/60/120-minute study plan, project progress, per-skill progress, recent activity, study streak and quick actions.
- **Roadmap**: 13 phases and 144 topics, from C# fundamentals to full-stack projects. SQL Server topics focus on what a SQL developer needs for .NET work, and each can be marked "already known".
- **Topic pages** cover: what it is, why it matters, how it works, a real-world example, a code example, a practice task, an independent challenge, verified resources, prerequisites, topics it unlocks, related projects, interview questions, exercises and notes. You can also set status, prior knowledge, confidence (0–5), add the topic to spaced review, and log study sessions.
- **Learning Library**: server-side search, filters (skill, phase, status, priority, knowledge) and pagination. The filters are kept in the URL.
- **Four projects**: Employee Management (C# console), Inventory API, Project Dashboard (Angular) and Sales and Order Management (full stack). They have 16 milestones, 62 tasks with acceptance criteria and topic links, 15 realistic **change requests** that unlock as a project progresses, a portfolio checklist and a repository link.
- **Practice Lab**: 39 coding, debugging, real-world scenario and code-review exercises. The API enforces the flow *attempt → hints → solution*, so the solution is never sent before you've saved your own attempt.
- **Interview preparation**: 61 questions in 11 categories, each linked to a topic. Study mode shows question and answer; practice mode shows one question at a time and you rate yourself (need review / partial / confident).
- **Resources**: 145 free, mostly official links. Each one was checked over HTTP when it was seeded, and a **"Check all links"** button re-verifies them on demand.
- **Notes**: a searchable knowledge base. A note can be linked to a topic, project, task or interview question. Deleting asks for confirmation, and you're warned about unsaved changes.
- **Progress and analytics**: separate progress per technology and per phase, a confidence distribution, project and practice completion, interview stats, study time per week, achievements, weak areas, a **weekly review** with suggested priorities, and the **spaced-review queue**.
- **Career readiness**: eight evidence-based areas, each with an explanation, the evidence behind it and a next step, plus the portfolio checklist for every project. There is deliberately no single "job-ready %".
- **Global search** (press <kbd>/</kbd>) across topics, projects, tasks, exercises, interview questions, resources and notes, in English or Arabic.
- **Bilingual UI** with full RTL layout, **light/dark/system themes**, a responsive layout (desktop to mobile drawer), keyboard support, skeletons, empty and error states, toasts, confirmation dialogs and reduced-motion support.

## Prerequisites

| Tool | Version used here | Check |
|---|---|---|
| .NET SDK | 10.0 | `dotnet --list-sdks` |
| Node.js / npm | Node 22+ (tested on 26) | `node --version` |
| SQL Server | **LocalDB** (installed with Visual Studio / SQL Server Express) *or* any local SQL Server instance | `sqllocaldb info` |
| EF Core CLI | 10.x | `dotnet tool install --global dotnet-ef` |
| VS Code | with the recommended extensions in `.vscode/extensions.json` | |

## Quick start

```bash
# 1) Backend: restore, create the database, run (http://localhost:5080)
cd backend/DevPath.Api
dotnet restore
dotnet ef database update      # creates the "DevPath" database on LocalDB
dotnet run                     # also seeds the learning content on start-up
```

```bash
# 2) Frontend, in a second terminal (http://localhost:4200)
cd frontend
npm install
npm start                      # = ng serve
```

Open **http://localhost:4200**, create an account on the sign-up page, and you're in. In VS Code you can instead run the task **"dev: start everything"**, or use the **"Full stack: API + Web"** debug configuration.

> The API applies pending migrations and runs the idempotent content seeder every time it starts (`Database:MigrateOnStartup` / `Database:SeedOnStartup` in `appsettings.json`). Running `dotnet ef database update` first isn't strictly required, but it's the standard workflow and good practice.

## SQL Server setup

The default connection string uses **LocalDB with Windows authentication**, so it contains no password:

```json
"ConnectionStrings": {
  "DevPath": "Server=(localdb)\\MSSQLLocalDB;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True"
}
```

- **Check LocalDB:** `sqllocaldb info MSSQLLocalDB`, then `sqllocaldb start MSSQLLocalDB`.
- **No LocalDB?** Install *SQL Server Express* (choose the LocalDB feature) or Visual Studio's "Data storage and processing" workload.
- **Using a full SQL Server instance instead** (for example the `MSSQLSERVER` service): start the service and override the connection string with **user secrets**, which are stored outside the repository:

  ```bash
  cd backend/DevPath.Api
  dotnet user-secrets set "ConnectionStrings:DevPath" "Server=localhost;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True"
  # SQL authentication (never commit this):
  # dotnet user-secrets set "ConnectionStrings:DevPath" "Server=localhost;Database=DevPath;User Id=devpath;Password=...;TrustServerCertificate=True"
  ```

- **No LocalDB on this machine?** Point the API at your local instance for the current terminal only, without changing any file:

  ```bash
  # bash
  ConnectionStrings__DevPath="Server=localhost;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True" dotnet run
  ```
  ```powershell
  # PowerShell
  $env:ConnectionStrings__DevPath = "Server=localhost;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True"; dotnet run
  ```

- **Inspect the data** in SSMS, Azure Data Studio or the VS Code *SQL Server (mssql)* extension by connecting to `(localdb)\MSSQLLocalDB`. Enums are stored as readable strings such as `'Completed'`.
- **Back up before experimenting** with schema changes: `sqlcmd -S "(localdb)\MSSQLLocalDB" -E -Q "BACKUP DATABASE DevPath TO DISK='C:\temp\DevPath.bak'"`.
- **Generate a reviewable SQL script** for the migrations: `dotnet ef migrations script --idempotent -o devpath.sql`.

## Project structure

```text
Roadmap/
├── DevPath.slnx                      # .NET solution
├── backend/
│   ├── DevPath.Api/
│   │   ├── Controllers/              # thin HTTP layer (8 controllers)
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs       # model configuration: keys, indexes, check constraints, delete rules
│   │   │   ├── DatabaseInitializer.cs
│   │   │   └── Seeding/              # idempotent seeder + seed-file shapes
│   │   ├── DTOs/                     # API contracts (records)
│   │   ├── Middleware/               # GlobalExceptionHandler (ProblemDetails), RequestTimingMiddleware
│   │   ├── Migrations/               # EF Core migrations
│   │   ├── Models/                   # entities: content vs user data
│   │   ├── SeedData/                 # learning content (JSON) + code snippets (.cs/.ts/.sql…)
│   │   ├── Services/                 # business logic, calculators, recommendation engine
│   │   ├── Validation/               # consistent 400 responses
│   │   ├── DevPath.Api.http          # example requests (REST Client)
│   │   └── Program.cs
│   └── DevPath.Api.Tests/            # xUnit: unit, seeder and HTTP API tests
├── frontend/
│   └── src/app/
│       ├── core/                     # ApiService, models, loader, i18n (en.ts / ar.ts), theme/toast/confirm
│       ├── shared/                   # icons, progress ring/bar, code block + highlighter, states, dialogs
│       ├── layout/                   # shell, global search, study-session dialog
│       ├── features/                 # one folder per page (lazy-loaded routes)
│       ├── app.routes.ts
│       └── app.config.ts
├── docs/screenshots/
└── .vscode/                          # tasks, launch configs, recommended extensions
```

## Architecture and design decisions

- **Modular monolith with no extra layers.** Controllers call services, and services use `AppDbContext` directly. There's no generic repository, CQRS or MediatR, because nothing here needs them.
- **Content and user data are kept apart.** Seeded tables (`Topics`, `Projects`, `PracticeExercises`…) are separate from user-owned tables (`TopicProgress`, `Notes`, `StudySessions`…). The seeder never touches user tables, so re-seeding or editing content can't wipe your progress.
- **One canonical record per topic.** English and Arabic live in `…En` / `…Ar` columns on the same row, and every relationship (prerequisites, resources, tasks, exercises, questions, notes, reviews) points to that single topic id.
- **Pure calculation code.** Progress, recommendations and review scheduling are pure functions over a small in-memory snapshot (`LearningState`), so they're transparent and unit-tested.
- **Consistent errors.** All errors are RFC 7807 `ProblemDetails` with a stable `code` (`not_found`, `attempt_required`, `task_locked`, `validation_failed`…) that the UI translates. Stack traces are logged, never returned.
- **Safety:** parameterised queries everywhere (LIKE wildcards are escaped), DTOs (no over-posting), server-side validation, check constraints in the database, CORS limited to the Angular origin, and no secrets in the repository.
- **Frontend:** standalone components, signals, zoneless change detection, Reactive Forms, lazy routes and one `ApiService`. A small `createLoader()` helper gives every page loading, error and empty states.
- **Offline-friendly:** fonts are bundled locally with Fontsource, icons are inline SVG, and nothing calls external services except the resource links you open and the optional link checker.

## Data model

```text
Phase 1──* Topic *──* Topic            (TopicPrerequisite: Topic → PrerequisiteTopic)
             │ *──* Resource           (ResourceTopic)
             │ 1──* PracticeExercise
             │ 1──* InterviewQuestion
             │ *──* ProjectTask        (ProjectTaskTopic)
             └ 1──0..1 TopicVideoCache (shared YouTube suggestions)
Project 1──* ProjectMilestone 1──* ProjectTask
Project *──* PortfolioChecklistItem

AppUser (AspNetUsers) 1──* every user table below; each row is (UserId, …) and private to that account
  TopicProgress (UserId, TopicId)           status, prior knowledge, confidence 0–5
  ReviewSchedule (UserId, TopicId)          spaced review; references the topic, never a copy
  PracticeProgress (UserId, ExerciseId)     ProjectTaskProgress (UserId, ProjectTaskId)
  InterviewProgress (UserId, QuestionId)    PortfolioCheck (UserId, ProjectId, ChecklistItemId)
  ProjectRepository (UserId, ProjectId)     LearningPreference (UserId)
  StudySession, Note (Id + UserId)          Note → at most one of Topic / Project / ProjectTask / InterviewQuestion
  UserTopicVideo (Id + UserId)              VideoProgress (UserId, VideoId): watched / saved
```

Content tables have foreign keys, unique indexes on every slug/key, check constraints (confidence 0–5, minutes 1–1440, a note linked to at most one item, no self-prerequisite) and delete rules chosen to avoid SQL Server's multiple-cascade-path error. Deleting an account deletes its rows. Derived values such as percentages and achievements are **calculated, not stored**.

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | API + database status (used by the offline banner) |
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/roadmap` | Phases → topics with progress |
| GET | `/api/topics?q&skill&status&phaseId&priority&knowledge&page&pageSize` | Paged, filtered topics |
| GET | `/api/topics/{id}` | Topic detail with all relationships |
| PUT | `/api/topics/{id}/progress` | Status, prior knowledge, confidence |
| GET | `/api/recommendations?minutes&take` | "What should I study next?" with reasons |
| GET | `/api/study-plan?minutes` | 15–240-minute plan |
| GET/POST/DELETE | `/api/study-sessions` | Study sessions (no future dates) |
| GET | `/api/projects`, `/api/projects/{id}`, `/api/projects/{id}/tasks` | Projects, milestones, tasks, change requests, portfolio |
| PUT | `/api/project-tasks/{id}/progress` | Task status (409 if locked; 400 if blocked without a reason) |
| PUT | `/api/projects/{id}/portfolio/{itemId}`, `/api/projects/{id}/repository` | Portfolio checklist, repo URL |
| GET | `/api/resources?topicId&type&skill&q` | Resources |
| POST | `/api/resources/verify` | Re-check every link over HTTP |
| GET | `/api/practice?type&topicId&skill`, `/api/practice/{id}` | Exercises (hints and solution only once revealed) |
| PUT/POST | `/api/practice/{id}/attempt`, `/hints`, `/solution`, `/status` | Practice workflow |
| GET/PUT | `/api/interviews?category&topicId&rating`, `/api/interviews/{id}/progress` | Interview questions and self-rating |
| GET/POST/PUT/DELETE | `/api/notes`, `/api/notes/{id}` | Notes CRUD and search |
| GET/PUT/POST/DELETE | `/api/reviews`, `/api/reviews/{topicId}`, `/api/reviews/{topicId}/complete` | Spaced-review queue |
| GET | `/api/progress`, `/api/progress/weekly?weekOf` | Analytics, weekly review |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Create an account, sign in, sign out (sets or clears the HttpOnly cookie) |
| GET | `/api/auth/me` | The signed-in account (401 when signed out) |
| POST | `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/change-password` | Password recovery and change |
| GET/POST | `/api/topics/{id}/videos` | Suggested + your own videos for a topic; add a video by YouTube link |
| DELETE | `/api/topic-videos/{id}` | Remove a video you added |
| PUT | `/api/videos/{videoId}/progress` | Your "watched" / "saved" flags for a video |

Every endpoint except `/api/health` and the sign-up, sign-in and password-recovery endpoints requires a signed-in account and answers **401** with code `unauthenticated` otherwise.
| GET | `/api/career-readiness` | Readiness areas and portfolio checklist |
| GET | `/api/search?q` | Global search (min. 2 characters) |
| GET/PUT | `/api/preferences` | Learning preferences |

The full OpenAPI document is at `http://localhost:5080/openapi/v1.json` (Development only). Example requests are in [`DevPath.Api.http`](backend/DevPath.Api/DevPath.Api.http).

## Accounts and data privacy

- **Authentication** uses **ASP.NET Core Identity** with the same SQL Server database (`AspNetUsers`…). Passwords are stored as salted PBKDF2 hashes, never as text. Rules: at least 8 characters with a letter and a digit; emails are unique (case-insensitive, also enforced by a unique index); 5 wrong passwords lock the account for 5 minutes; sign-up, sign-in and password-reset requests are rate-limited per client address (`Auth:AttemptsPerMinute`).
- **Sessions** are an **HttpOnly, SameSite=Strict cookie** (`devpath.auth`, 14 days, sliding). JavaScript can't read it, it survives page refreshes, and the browser won't send it from other sites. Changing or resetting the password signs out your other devices within 5 minutes. When a session ends, the next API call answers 401 and the app returns to the sign-in page, then back to where you were.
- **Every endpoint is protected on the server** by a fallback authorization policy; the Angular guards only decide navigation.
- **Data isolation is enforced in the database layer.** Every user table has a `UserId` column (foreign key to `AspNetUsers`, cascade delete) and is part of the key (for example `TopicProgress (UserId, TopicId)`). `AppDbContext` adds a **global query filter** `UserId == current user` to every user table, and fills in `UserId` itself when a row is saved, refusing to change or delete another account's row. So a service can't return someone else's data even if it forgets a `Where`, and putting another account's id in a URL or body simply returns **404**.
- **Shared content** (phases, topics, resources, projects, exercises, interview questions, and the cached YouTube suggestions) is the same for everyone and read-only.
- **Password reset**: the app runs locally without a mail server, so the reset link is written to the **API console** (log level Warning). Register another `IAccountEmailSender` in `Program.cs` to send real email. Links expire after 1 hour and work once.

### Data from before accounts existed

The `AddAccountsAndVideos` migration keeps any progress, notes and other personal data that already exist (nothing is deleted). Because that data has no owner, it is kept under a placeholder account (`legacy-local-data`) that can't sign in, and nobody sees it. To move it to your account, create the account, then run once:

```bash
cd backend/DevPath.Api
dotnet user-secrets set "LegacyData:AssignToEmail" "you@example.com"
dotnet run      # the log says how many rows were moved
dotnet user-secrets remove "LegacyData:AssignToEmail"
```

The target account must have no data of its own yet, so nothing is overwritten. A fresh database has no legacy data and no placeholder account.

## YouTube videos

Each topic page has a **Videos** section:

- **Suggestions** are found with the **YouTube Data API v3**: the API searches for "*skill* + *topic title* tutorial" (for example "C# Loops tutorial"), confirms each result is public, processed and embeddable, and drops Shorts, very long streams, near-duplicate titles, videos for another stack (a C# topic won't show Python) and videos whose title doesn't mention the topic. Results are **cached per topic for 30 days** and shared by all accounts, so each topic costs about 101 quota units a month (the free daily quota is 10,000).
- **Add your own** by pasting any YouTube link (watch, youtu.be, shorts or embed). The API checks it with YouTube's public oEmbed endpoint, so this works **without an API key**, and rejects missing, private and non-embeddable videos. Added videos are private to your account.
- Videos play in the page with the privacy-enhanced player (`youtube-nocookie.com`), loaded only when you click; every card also links to YouTube.
- **"Watched" and "Saved"** flags are stored per account.
- Without an API key, the section explains that suggestions aren't set up and offers a YouTube search link and the add-by-link form. When the daily quota runs out, the cached suggestions keep showing.

**To turn on suggestions**, create an API key in Google Cloud (enable *YouTube Data API v3*), then store it outside the repository:

```bash
cd backend/DevPath.Api
dotnet user-secrets set "YouTube:ApiKey" "YOUR_KEY"
```

The key is used only by the API; it is never sent to the browser.

## Bilingual UI and right-to-left support

- **UI strings** are in `frontend/src/app/core/i18n/en.ts` and `ar.ts`. The `Translations` type makes `ar.ts` match `en.ts` key for key, so a missing Arabic string is a **compile error**. Components use the `t` pipe: `{{ 'nav.dashboard' | t }}`.
- **Learning content** comes from the API in both languages, and the `loc` pipe picks the right field (`{{ topic | loc: 'title' }}`), falling back to English. Switching language is instant, with no new request.
- **Direction:** `I18nService` keeps the language in a signal. An effect sets `<html lang>` and `<html dir="rtl|ltr">` and saves the choice in `localStorage`. A tiny script in `index.html` applies the saved language and theme before Angular starts, so there's no flash.
- **Layout mirrors automatically**, because all CSS uses logical properties (`margin-inline-start`, `inset-inline-end`…). Directional icons (chevrons, arrows) are flipped in RTL; the mobile drawer slides in from the right.
- **Code stays left-to-right:** code blocks, URLs and the tech-stack lines use `dir="ltr"`.
- **Mixed Arabic and English text:** invisible left-to-right marks are added so that `C#`, `.NET`, `First()` and `409 Conflict` don't get reordered inside Arabic sentences.
- **Fonts:** Inter for English, IBM Plex Sans Arabic for Arabic and JetBrains Mono for code, all bundled locally. Dates use Arabic month names with Western digits (`ar-EG-u-nu-latn`), so they read well next to code and percentages.

## How progress, recommendations and reviews are calculated

**Weighted progress** (`Services/ProgressOptions.cs`, configurable in `appsettings.json` → `Progress`):

```text
topic weight = priority weight (Core 3, Important 2, Optional 1) × skill weight (SQL Server 0.4, Git 0.6, C# 1.0 …)
progress %   = Σ weight of finished topics ÷ Σ weight of all topics
```

SQL Server's low weight means that marking your existing SQL knowledge as known doesn't make you look ready in C# or Angular. Per-skill and per-phase progress, confidence, projects and interview practice are always shown **separately**.

**"What should I study next?"** (`Services/RecommendationEngine.cs`) is a deterministic score with **no AI**. A topic is a candidate only if it isn't finished and its prerequisites are done (unless you allow skipping them in Settings). Points are given for being in progress, being in the current phase, core priority, a "need to learn" mark, low confidence, being needed by your active project, unlocking other topics, matching your focus skill and fitting the time you have. Each bonus comes with a reason code that the UI shows you.

**Spaced review** (`Services/ReviewService.cs`): the next review depends only on your confidence at the end of a review: 0–1 → 1 day, 2 → 2 days, 3 → 4 days, 4 → 8 days, 5 → 16 days.

## Editing the learning content

All content lives in `backend/DevPath.Api/SeedData/`:

- `roadmap/NN-*.json`: one file per phase (topics, explanations, tasks, prerequisites)
- `projects.json`, `portfolio-checklist.json`, `resources.json`, `practice/*.json`, `interviews/*.json`
- `snippets/{topics|practice|interviews}/{key}.{cs|ts|sql|html|sh|http|txt}`: code samples as real files. The extension sets the language, and `*.solution.*` holds exercise solutions.

Edit a file and restart the API. The seeder **inserts or updates rows by slug or key** and keeps link tables in sync. Before touching the database it validates the content (duplicate keys, unknown topic references, prerequisite cycles) and fails with a clear message if something is wrong. Your progress is never affected.

## Tests

```bash
dotnet test DevPath.slnx          # 112 backend tests
cd frontend && npm test           # 26 frontend tests (Vitest), add -- --watch=false for one run
```

- **Backend (xUnit):** progress weighting (including "SQL knowledge doesn't inflate progress"), recommendation rules, review intervals, week boundaries and streaks; the seeder (full content, idempotent re-seeding that keeps user progress, rejection of invalid data); and HTTP tests through `WebApplicationFactory` (status codes, ProblemDetails codes, validation, notes CRUD, practice gating, locked change requests, Arabic search…).
- **Accounts and isolation:** sign-up (password hashing, HttpOnly cookie, duplicate emails, password rules), sign-in errors, lockout, rate limiting, sign-out, session reuse and tampered cookies, password reset (single use) and change; two accounts where B can't read, edit or delete A's notes, progress, reviews, sessions, project data, practice answers, preferences or videos by id, while shared content stays identical; the legacy-data handover.
- **Videos:** relevance filtering, shared cache, missing key, quota and network failures, link validation, duplicates and per-account flags. YouTube is replaced by a fake, so tests never use the internet.
- The API tests use **in-memory SQLite** so they never touch your LocalDB database. SQLite can't verify SQL Server-specific behaviour (for example `rowversion` or exact collation), so that was checked separately against LocalDB.
- **Frontend (Vitest):** password rules, safe return URLs, auth error messages, YouTube link parsing and URL building; language switching, RTL, persistence and fallback; bidi marks; HTML escaping in the highlighter; the loader states; the progress ring.

## Troubleshooting

| Problem | Fix |
|---|---|
| Sent back to the sign-in page | Your session ended (expired, or the password was changed elsewhere). Sign in again. |
| Can't find the password-reset email | There's no mail server locally: the link is in the API console window. |
| Videos say suggestions aren't set up | Set `YouTube:ApiKey` with `dotnet user-secrets` (see [YouTube videos](#youtube-videos)) and restart the API. |
| Red banner "The API is offline" | Start the backend (`dotnet run` in `backend/DevPath.Api`) and click **Check again**. |
| `Cannot open database "DevPath"` / network error 26 at start-up | LocalDB isn't running: `sqllocaldb start MSSQLLocalDB`. If you use a full instance, check the service and the user-secret connection string. |
| `dotnet ef` not found | `dotnet tool install --global dotnet-ef`, then open a new terminal. |
| Browser console: *blocked by CORS policy* | The page must be served from `http://localhost:4200`. To use another port, add it to `Cors:AllowedOrigins` in `appsettings.json`. |
| Port 5080 or 4200 already in use | Change `applicationUrl` in `Properties/launchSettings.json` (and `API_BASE_URL` in `core/api.service.ts`), or run `ng serve --port 4300` and add that origin to CORS. |
| `MSB3027: file is locked` when building or testing | The API is still running and locks its DLL. Stop it first. |
| Seed error on start-up | The message names the bad key or reference in `SeedData`. Fix the JSON and restart. |
| Want to start over | `dotnet ef database drop` then `dotnet ef database update`. **This deletes your progress.** Back up first. |

## Known limitations

- Password-reset links are logged to the API console instead of emailed until you plug in a real `IAccountEmailSender`.
- There are no roles or admin screens: every account is an ordinary learner, and learning content is edited through `SeedData`.
- Automatic video suggestions need a YouTube Data API key; relevance filtering is rule-based, so an occasional off-target video can slip through (add your own instead).
- Practice exercises are **not executed** in the browser: you write and run code in your own editor, then compare.
- Link verification needs internet access. Some sites block automated requests, so they can show as "Not verified" even though they work in a browser.
- The highlighter is intentionally minimal (keywords, strings, comments, numbers, types).
- Arabic counts use a "label: value" form instead of full Arabic plural rules.
- Learning content is written for this curriculum; review it as technologies change (Angular and .NET release yearly).

## Ideas for future improvements

- Export and import of your progress (JSON) and a one-click database backup from Settings
- A Markdown preview for notes, and attaching notes to practice exercises
- Calendar heat-map of study sessions; goals per week
- Optional content packs (Docker, Azure, CI/CD) as extra phases
- Playwright end-to-end tests committed to the repo and run in CI

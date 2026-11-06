# .NET job-market research and roadmap update — run 2026-11-06

Period covered: **2026-08-06 to 2026-11-06** (the last three months).
Data: [`postings.json`](postings.json). Generated analyses: [`analysis-baseline.md`](analysis-baseline.md)
(the market against the roadmap **before** this change) and [`analysis.md`](analysis.md) (after it).
How to repeat the research: [`tools/market-research/README.md`](../../../../tools/market-research/README.md).

## A. Research summary

### Sources and method

| Source | Used? | Notes |
|---|---|---|
| Indeed (official Indeed connector: `search_jobs`, `get_job_details`) | Yes, the only source | Full job descriptions were read for every posting counted. Each posting is cited by its `to.indeed.com` link in `postings.json`. |
| LinkedIn | **No** | No permitted LinkedIn access (official API or connector) was available in this session. LinkedIn pages were not scraped, because that would bypass its login and anti-bot protection. |
| Other boards (Wuzzuf, Bayt, Glassdoor, company career sites) | No | Not reachable through a permitted connector in this session. |

Searches used ".NET developer", "ASP.NET Core developer", "C# developer", "full stack .NET Angular",
"senior .NET developer" and ".NET Core developer" for remote US roles and for Cairo, Dubai,
Abu Dhabi, Riyadh, Doha, London, Manchester, Dublin, Berlin, Munich, Amsterdam, Toronto, New York
and Dallas (the full list is in `tools/market-research/config.json`).

**Inclusion rule.** A posting counts when it was published inside the period, includes a job
description, and .NET/C# is the main stack of the role. Every technology was recorded as
**required** (must-have) or **preferred** (nice-to-have) as written in the posting.

| | Count |
|---|---|
| Postings analysed | **36** |
| Excluded (reasons recorded in `postings.json`) | 8: one outside the period, four where .NET was only one option among other languages, one non-.NET role, one without a description, one "register interest" advert that was not a live vacancy |
| Duplicates removed | 1 (the same Mazuma Software role listed twice) |

| Region | Postings | | Level | Postings |
|---|---|---|---|---|
| North America (US 13, Canada 4) | 17 | | Senior | 18 |
| Europe (UK 6, Ireland 4, Germany 1) | 11 | | Mid | 13 |
| Middle East (UAE 5, Saudi Arabia 1) | 6 | | Lead | 4 |
| Egypt | 1 | | Junior | 1 |
| International (India) | 1 | | Remote roles | 9 |

### Limitations — read before using the numbers

- **36 postings is a small sample.** Shares move by 2.8 points per posting, so treat differences
  of a few points as noise. The ranking is solid for the top technologies, which appear in
  10–17 postings; it is weak below about 5 postings.
- **One source.** Everything comes from Indeed. Indeed's rate limit stopped further collection at
  36 postings.
- **Egypt and the Middle East are under-represented.** Most Egyptian results on Indeed were older
  than three months, so only one Egyptian posting is in the period. The Egyptian market may weigh
  technologies differently; a future run should add a permitted Egyptian source.
- **Junior roles are almost absent** (1 of 36), so the results describe what mid and senior
  developers are hired for — the level the roadmap prepares for.
- Recruiters (marked "(recruiter)" in the data) sometimes post for unnamed clients; their
  postings were kept when the role and stack were clear.

### The core stack (not ranked, for reference)

| Technology | Postings | Share |
|---|---|---|
| C# | 31 | 86.1% |
| SQL Server | 28 | 77.8% |
| ASP.NET Core | 27 | 75.0% |
| Angular | 14 | 38.9% |
| Entity Framework Core | 13 | 36.1% |

## B. Ranking of additional technologies

Beyond the core stack, ranked by score. Score = (required + 0.5 × preferred) ÷ 36 × 100 ×
relevance weight (1.0 for central .NET full-stack skills, 0.8 for adjacent ones, 0.5 for
peripheral ones). "Roadmap before" is the coverage in the roadmap on `main` before this change.

| # | Technology | Postings | Share | Required | Preferred | Score | Roadmap before | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | REST APIs | 22 | 61.1% | 21 | 1 | 59.7 | covered | — |
| 2 | Git | 19 | 52.8% | 19 | 0 | 52.8 | covered | — |
| 3 | **CI/CD** | 17 | 47.2% | 15 | 2 | 44.4 | missing | **added** |
| 4 | **Agile/Scrum** | 16 | 44.4% | 15 | 1 | 34.4 | missing | **added** |
| 5 | JavaScript | 15 | 41.7% | 14 | 1 | 32.2 | covered | — |
| 6 | **Azure** | 14 | 38.9% | 9 | 5 | 31.9 | missing | **added** |
| 7 | HTML/CSS | 14 | 38.9% | 13 | 1 | 30.0 | covered | — |
| 8 | Unit testing | 10 | 27.8% | 10 | 0 | 27.8 | covered | — |
| 9 | **Azure DevOps** | 14 | 38.9% | 10 | 4 | 26.7 | missing | **added** |
| 10 | **Design Patterns** | 9 | 25.0% | 9 | 0 | 25.0 | missing | **added** |
| 11 | **Microservices** | 11 | 30.6% | 4 | 7 | 20.8 | missing | **added** |
| 12 | ASP.NET MVC | 9 | 25.0% | 9 | 0 | 20.0 | covered | — |
| 13 | OOP | 7 | 19.4% | 7 | 0 | 19.4 | covered | — |
| 14 | **Docker** | 10 | 27.8% | 3 | 7 | 18.1 | missing | **added** |
| 15 | ASP.NET | 8 | 22.2% | 8 | 0 | 17.8 | covered | — |
| 16 | **AWS** | 8 | 22.2% | 8 | 0 | 17.8 | missing | **added** |
| 17 | TypeScript | 6 | 16.7% | 4 | 2 | 13.9 | covered | — |
| 18 | LINQ | 5 | 13.9% | 5 | 0 | 13.9 | covered | — |
| 19 | Code review | 6 | 16.7% | 6 | 0 | 13.3 | covered | — |
| 20 | **Stored procedures** | 6 | 16.7% | 6 | 0 | 13.3 | mentioned only | **added** |
| 21 | Messaging | 5 | 13.9% | 4 | 1 | 12.5 | missing | covered by the new microservices topic |
| 22 | .NET Framework | 9 | 25.0% | 8 | 1 | 11.8 | missing | watch (legacy) |
| 23 | AI coding assistants | 5 | 13.9% | 5 | 0 | 11.1 | missing | watch |
| 28 | **Kubernetes** | 7 | 19.4% | 2 | 5 | 10.0 | missing | **added** |
| 29 | React | 9 | 25.0% | 5 | 4 | 9.7 | mentioned | watch |
| 30 | jQuery | 7 | 19.4% | 6 | 1 | 9.0 | missing | watch (legacy) |

The full ranking (about 140 technologies, with companies, levels and regions for each) is in
`analysis-baseline.md` and `analysis-baseline.json`.

### Evidence for the gaps: who asked for them

| Technology | Employers in the sample (recruiters marked) |
|---|---|
| CI/CD | 3Pillar Global, BAM Technologies, Citi, Creed Interactive, Global Information Technology, Hippo Digital, INNOBAYT, Luxoft, Quad Infotech, SupportSoft Technologies, Stellar Technologies, Version 1, Xpertbizz, CorGTA (r), Cpl (r), isgSearch (r), nexus-opus (r) |
| Agile/Scrum | 3Pillar Global, BAM Technologies, Excellent Webworld, Hippo Digital, Holman, INNOBAYT, JNL Technologies, MEDIFOX DAN, Mazuma Software, Tavant Technologies, Universal Technologies, Version 1, Client Server (r), CorGTA (r), Noir (r), nexus-opus (r) |
| Azure | 3Pillar Global, Creed Interactive, Excellent Webworld, Global Information Technology, Hippo Digital, INNOBAYT, JNL Technologies, Luxoft, SPLIIT, Tavant Technologies, Xpertbizz, CorGTA (r), Cpl (r), nexus-opus (r) |
| Azure DevOps | BAM Technologies, Corseez (Egypt), Hippo Digital, INNOBAYT, Luxoft, Mazuma Software, Quad Infotech, SupportSoft Technologies, Universal Technologies, Version 1, Xpertbizz, CorGTA (r), isgSearch (r), nexus-opus (r) |
| Microservices | 3Pillar Global, BAM Technologies, Excellent Webworld, Global Information Technology, Hippo Digital, INNOBAYT, Luxoft, MEDIFOX DAN, SupportSoft Technologies, CorGTA (r), nexus-opus (r) |
| Docker | BAM Technologies, Global Information Technology, Hippo Digital, INNOBAYT, Luxoft, MEDIFOX DAN, SPLIIT, SupportSoft Technologies, CorGTA (r), nexus-opus (r) |
| Design Patterns | BAM Technologies, Citi, Global Information Technology, INNOBAYT, Mazuma Software, Quad Infotech, SupportSoft Technologies, Xpertbizz, Client Server (r) |
| AWS | 3Pillar Global, BAM Technologies, Creed Interactive, Hippo Digital, MEDIFOX DAN, Client Server (r), CorGTA (r), isgSearch (r) |
| Kubernetes | BAM Technologies, Global Information Technology, Hippo Digital, Luxoft, SupportSoft Technologies, CorGTA (r), nexus-opus (r) |
| Stored procedures | Cotiviti, Kalsoft, SupportSoft Technologies, Version 1, Cpl (r), nexus-opus (r) |

## C. Gap analysis

The rule (in `config.json`): a technology is a gap to **add** when the roadmap has no topic for
it, at least 15% of postings ask for it, it appears in at least 5 postings and it is relevant to a
.NET full-stack developer; it is a gap to **improve** when it is only mentioned inside other topics.

| Gap | Share | Decision | Why |
|---|---|---|---|
| CI/CD + Azure DevOps | 47.2% / 38.9% | Add one topic covering both | Mostly a **requirement** (15 of 17). GitHub Actions and Azure Pipelines are taught side by side. |
| Agile/Scrum | 44.4% | Add | Almost always required (15 of 16). It belongs with the other professional skills. |
| Azure + AWS | 38.9% / 22.2% | Add two topics: cloud fundamentals (both providers), then hands-on Azure deployment | Azure appears more often and is the natural host for .NET; AWS is required in all 8 postings that name it, so the fundamentals cover both. |
| Microservices (and messaging) | 30.6% | Add | Mostly **preferred** (7 of 11), so it goes late in the roadmap as an advanced topic. Messaging (13.9%) is taught inside it. |
| Docker | 27.8% | Add | Mostly preferred (7 of 10), but it is a prerequisite for CI/CD images, Kubernetes and microservices. |
| Design Patterns | 25.0% | Add | Always required (9 of 9). It belongs right after SOLID. |
| Kubernetes | 19.4% | Add as **optional** | Mostly preferred (5 of 7), so it is marked Optional and Advanced. |
| Stored procedures | 16.7% | Improve: add a dedicated topic | Always required (6 of 6). Before, it was only mentioned inside other SQL topics. |

**Watched but not added** (not enough evidence in this run, or out of scope):

- .NET Framework (25%) and jQuery (19.4%): legacy maintenance. They are not worth a new learner's
  time; the roadmap already teaches the modern equivalents.
- React (25%): an alternative to Angular, not an addition. It is already mentioned.
- AI coding assistants (13.9%), LLM/Generative AI (11.1%), Python (13.9%), Jenkins (13.9%),
  PostgreSQL (11.1%), Software architecture (11.1%), Terraform (8.3%), Azure Functions (8.3%),
  OAuth 2.0 (8.3%), Background services (8.3%), Caching (5.6%), Clean Architecture (5.6%).

The roadmap now has **no add/improve gaps** for this run (see `analysis.md`).

## D. Roadmap changes

The roadmap grew from 13 phases and 150 topics to **14 phases and 159 topics**. Nothing was
removed, and no existing slug changed, so all user progress is kept.

| Change | Exact position |
|---|---|
| New topic `arch-design-patterns` | Phase 2 (OOP), position 8 of 9: after `oop-solid`, before `oop-object-modeling` |
| New topic `sql-stored-procedures` | Phase 6 (SQL Server), position 9 of 14: after `sql-injection`, before `sql-ef-generated-sql` |
| New topic `pro-agile-scrum` | Phase 12 (Professional skills), position 5 of 13: after `pro-requirements`, before `pro-code-review` |
| **New phase 13 "Cloud, DevOps & Distributed Systems"** | After phase 12 (Professional skills), before the projects phase |
| — `devops-docker` | Phase 13, position 1 |
| — `devops-ci-cd` | Phase 13, position 2 |
| — `cloud-fundamentals` | Phase 13, position 3 |
| — `cloud-azure-app-service` | Phase 13, position 4 |
| — `devops-kubernetes` | Phase 13, position 5 |
| — `arch-microservices` | Phase 13, position 6 |
| Phase "Projects" | Renumbered from 13 to 14 (file `14-projects.json`); its content is unchanged |
| `ts-narrowing` moved | Phase 7, now before `ts-error-handling`, which depends on it. This was the only existing ordering error found. |

### The new topics

Every new topic has bilingual content (what it is, why it matters, how it works, a real-world
example), learning objectives in both languages, a code example, three verified English videos,
verified resources, a three-question quiz, a practice task and an independent challenge.

| Topic | Skill / priority / difficulty / time | Prerequisites | Evidence |
|---|---|---|---|
| Design patterns in C# (Strategy, Factory, Decorator, Observer, Repository) | C# · Important · Intermediate · 60 min | `oop-solid`, `oop-interfaces` | 9/36 postings, all required |
| Stored procedures, views and functions in T-SQL | SQL Server · Important · Intermediate · 45 min | `sql-parameterization`, `sql-transactions` | 6/36, all required |
| Working in Agile teams: Scrum, user stories and estimation | Professional · Important · Beginner · 35 min | `pro-breaking-down-features`, `pro-requirements` | 16/36, 15 required |
| Containerising ASP.NET Core and Angular with Docker | DevOps · Important · Intermediate · 60 min | `pro-deployment`, `api-configuration` | 10/36, 3 required |
| CI/CD pipelines with GitHub Actions and Azure DevOps | DevOps · **Core** · Intermediate · 60 min | `devops-docker`, `git-pull-requests`, `test-unit-csharp` | CI/CD 17/36 and Azure DevOps 14/36 |
| Cloud fundamentals for .NET developers (Azure and AWS) | DevOps · Important · Beginner · 40 min | `pro-deployment` | Azure 14/36, AWS 8/36 |
| Deploying to Azure: App Service, Azure SQL, Key Vault and monitoring | DevOps · Important · Intermediate · 75 min | `cloud-fundamentals`, `devops-ci-cd` | Azure 14/36 |
| Kubernetes basics for application developers | DevOps · Optional · Advanced · 60 min | `devops-docker`, `cloud-fundamentals` | 7/36, 2 required |
| Microservices, messaging and distributed systems | ASP.NET Core · Important · Advanced · 60 min | `devops-docker`, `fs-api-contracts`, `sql-transactions` | Microservices 11/36, messaging 5/36 |

Each topic's practice task and challenge build on the roadmap's own projects (Project 2's API and
the Project 4 portfolio system). For example, the Docker challenge containerises the full Project
4 stack, the CI/CD challenge builds its two-stage pipeline, and the Azure challenge takes it to
production with deployment slots, Key Vault and alerts. The full text is in
`backend/DevPath.Api/SeedData/roadmap/` (`02-oop.json`, `06-sql-server.json`,
`12-professional.json` and `13-cloud-devops.json`).

**Resources added** (all checked on 2026-11-06 and returned HTTP 200): Microsoft Learn (Docker for
.NET, Azure Pipelines for .NET, App Service + Azure SQL tutorial, Key Vault configuration, Azure
Monitor OpenTelemetry, Azure Fundamentals, .NET microservices architecture e-book and Kubernetes
module, stored procedures), Docker Docs, GitHub Docs, AWS (cloud computing, AWS SDK for .NET,
Elastic Beanstalk for .NET), kubernetes.io, martinfowler.com, Refactoring.Guru, the Scrum Guide and
Atlassian. All 27 videos were confirmed to exist through YouTube's oEmbed endpoint.

**Practice exercises added:** three scenarios. One for Docker ("the container works on your machine
but crashes in staging"), one for CI/CD ("the main pipeline turned red after a merge") and one for
Azure ("a production connection string was committed").

## E. Implementation results

### What changed in the application

- **Database** (migration `AddTopicObjectivesAndMarketDemand`). It is additive and reversible:
  `Down` removes everything it adds.
  - `Topics.ObjectivesEn`, `Topics.ObjectivesAr` (default empty) and `Topics.Difficulty` (nullable).
  - A new table, `TopicDemand`: technology, postings, required, share, total postings, run and
    period, per topic.
  - No existing column or row is changed or deleted. User progress is keyed by topic id and is
    preserved; the seeder updates topics by slug.
- **Seeder.**
  - It loads the objectives, the difficulty and the generated `SeedData/market-demand.json`.
  - It now rejects a topic placed before one of its prerequisites.
  - It rejects objectives whose English and Arabic lists differ in length.
  - It rejects demand rows that name an unknown topic.
- **API.** `GET /api/topics/{id}` also returns `objectivesEn`, `objectivesAr`, `difficulty` and
  `demand` (ordered by share).
- **Skill area.** `DevOps` was added, with a progress weight of 0.8.
- **Frontend.**
  - The topic page shows the learning objectives, a difficulty chip and a "Job market demand"
    card: share, postings, how many required it, and the period, in English and Arabic.
  - The skill filters include "Cloud & DevOps".
  - YAML and Dockerfile code examples are labelled correctly.
- **Tooling.** `tools/market-research` (config, library, tests, analysis script) and
  `docs/market-research` (runs and history), documented in `tools/market-research/README.md`.

### Tests run

| Suite | Result |
|---|---|
| Backend (`dotnet test`, xUnit) | **222 passed**, 0 failed (previously 218). New tests cover: the new topics' objectives, difficulty and demand; the prerequisite order across the whole roadmap; the rejection of a topic placed before its prerequisite; and the topic-detail API returning objectives and demand. |
| Frontend (`ng test`, Vitest) | **82 passed**, 0 failed (previously 79). The new component test renders the topic page in English and Arabic and checks the objectives, the difficulty and the demand card, and that they are hidden for a topic without them. |
| Frontend production build (`ng build`) | Succeeds; the initial bundle is 597 kB, under the 600 kB budget |
| Research toolkit (`node --test tools/market-research/lib.test.mjs`) | **7 passed** |
| Seed integrity | 159 topics and 14 phases. No duplicate slugs or keys, no missing prerequisites, no cycles, **no prerequisite placed after its topic**. Every topic has a quiz, a code example, Arabic text and 2–4 English videos. |

The migration was tested against SQLite in the test suite and applied to the local SQL Server
development database. **It has not been applied to production**; that happens when the branch is
merged and deployed, which needs the owner's approval.

## F. Recommended next skills

For learners, after the core roadmap, in this order:

1. **CI/CD and Docker.** Together they are the most requested skills beyond the core (47% and 28%),
   and they make every later topic easier to practise.
2. **Azure deployment.** Put Project 4 online. A live URL in a CV answers the "Azure" requirement
   that 39% of postings list.
3. **Design patterns and stored procedures.** These are short topics, and they are **always**
   required when they are listed.
4. **Agile/Scrum.** Learn it before the first interviews; 15 of 16 postings that mention it
   require it.
5. **Microservices, then Kubernetes.** These are mostly listed as preferred and appear in senior
   roles. Learn them after the rest.

For the next research run:

- Add a permitted second source (LinkedIn through an official integration, or Egyptian and Gulf
  job boards that allow it) to fix the Egypt and Middle East under-representation.
- Raise the sample to 80–100 postings so that shares below 15% become meaningful.
- Watch **AI coding assistants / LLM integration** (14% and 11% now), **PostgreSQL**, **OAuth 2.0
  / Entra ID**, **caching / Redis** and **Clean Architecture**. Add topics if they cross the 15%
  threshold in the next run.

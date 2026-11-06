# Roadmap implementation report: LinkedIn research (2026-11-06)

**Branch:** `feature/market-driven-roadmap-update`

**Inputs:**
- the LinkedIn summary in
  [docs/market-research/sources/2026-11-06-linkedin-summary.md](market-research/sources/2026-11-06-linkedin-summary.md);
- the gap analysis in [docs/roadmap-gap-analysis.md](roadmap-gap-analysis.md), approved by the owner
  before implementation.

The owner asked for English videos only, picked from the most-watched results of a web search
for each topic. The only check was whether each video exists.

## Architecture found

- **Content:** all roadmap content is in `backend/DevPath.Api/SeedData`. The phases are in
  `roadmap/NN-*.json`. The material for each topic is kept separately and keyed by its slug:
  - `videos.json`
  - `quizzes/*.json`
  - `snippets/topics/*`
  - `resources.json`
  - `market-demand.json`

  The Angular app has no copy of this content.
- **Order and ids:** the seeder upserts topics by slug on every start-up and renumbers `Order`
  from each topic's position in its file. Topic ids never change.
- **Progress:** progress points to `TopicId`, so inserting topics between existing ones is safe.
- **No migration:** no field had to be added, so there is no new migration.

## Final gap-analysis status

Everything was implemented as listed in the gap analysis, with no change.

**7 topics added:**

| New topic | Phase | Position (after → before) | Prerequisites | Priority | Evidence (LinkedIn) |
|---|---|---|---|---|---|
| HTML and CSS for application developers (`web-html-css`) | 7 TypeScript | start of phase → `web-javascript-essentials` | `cs-project-structure` | Important | 36% |
| JavaScript essentials (`web-javascript-essentials`) | 7 TypeScript | `web-html-css` → `ts-types-inference` | `web-html-css`, `cs-methods` | Important | 40% |
| Clean and Onion Architecture, with CQRS (`arch-clean-architecture`) | 12 Professional | `pro-refactoring` → `arch-domain-driven-design` | `arch-design-patterns`, `api-dependency-injection`, `ef-dbcontext`, `test-mocking`, `pro-refactoring` | Important | 20% (family 28%) |
| Domain-Driven Design essentials (`arch-domain-driven-design`) | 12 Professional | `arch-clean-architecture` → `dotnet-legacy-modernization` | `arch-clean-architecture`, `cs-records`, `ef-relationships` | Optional | 16% |
| Legacy .NET and migration to modern .NET (`dotnet-legacy-modernization`) | 12 Professional | `arch-domain-driven-design` → `pro-security` | `pro-reading-codebases`, `pro-refactoring`, `test-integration` | Important | 36% (family) |
| AI in .NET: LLMs, RAG and AI-assisted development (`ai-dotnet-llm`) | 13 Cloud & DevOps | `cloud-azure-app-service` → `devops-kubernetes` | `cloud-azure-app-service`, `api-configuration` | Optional | 28% (family) |
| Message brokers with RabbitMQ (`arch-message-brokers`) | 13 Cloud & DevOps | `arch-microservices` → end of phase | `arch-microservices` | Important | 20% |

**Every new topic includes:**
- the summary, why, how, example, practice (2–4 tasks) and challenge texts in English and Arabic;
- 5 learning objectives in each language;
- difficulty and minutes;
- a code sample;
- 3 quiz questions;
- 3–4 English videos;
- 1–2 official resources;
- job-market demand from the Indeed run. The taxonomy in `tools/market-research/config.json` now
  points to the new slugs, and `analyze.mjs` was run again.

**9 existing topics enhanced in place.** Their slug, title, phase and position are unchanged.

| Topic | What was added |
|---|---|
| `sql-tables-keys` | Normalisation (1NF–3NF) and deliberate denormalisation |
| `api-authentication` | OAuth 2.0 and OpenID Connect, SSO through an identity provider (Entra ID, Keycloak, IdentityServer, Auth0) |
| `fs-auth-flow` | Authorization-code flow with PKCE in Angular, backend-for-frontend with an HttpOnly cookie |
| `pro-code-review` | Reviewing and owning AI-generated code |
| `test-integration` | `WebApplicationFactory` with SQL Server in Testcontainers |
| `pro-performance` | IMemoryCache, HybridCache, Redis distributed cache, output caching, invalidation |
| `sql-data-access-design` | A Dapper example, running EF Core on PostgreSQL (Npgsql) |
| `pro-logging-diagnostics` | Serilog structured logging, OpenTelemetry, Grafana/Jaeger/Application Insights, health checks |
| `devops-kubernetes` | Priority changed from Optional to Important (32% of postings, 20% mandatory) |

**Not added, with the reason:**
- **Event-driven architecture as its own topic:** it would overlap the microservices and broker
  topics by more than 50%. Retries, dead-letter queues and saga are covered in
  `arch-message-brokers`, and domain events in DDD.
- **OAuth/OIDC as its own topic:** section A of the prompt says not to.
- **Caching, PostgreSQL and CQRS as their own topics:** the evidence is low, so they are sections
  of existing or new topics.
- **Python and the low-priority electives:** they are outside the .NET full-stack path.

## Files changed

**Content:**
- `SeedData/roadmap/07-typescript.json`, `12-professional.json` and `13-cloud-devops.json`
  (new topics);
- `SeedData/roadmap/04-aspnet-core.json`, `05-ef-core.json`, `06-sql-server.json`,
  `09-integration.json` and `10-testing.json` (enhancements);
- `SeedData/videos.json` (23 English videos);
- `SeedData/quizzes/07-typescript.json`, `11-professional.json` and `12-cloud-devops.json`
  (21 questions);
- `SeedData/resources.json` (9 resources);
- `SeedData/snippets/topics/*` (7 new files);
- `SeedData/market-demand.json` (regenerated).

**Research toolkit:**
- `tools/market-research/config.json`: the taxonomy now points to the new topics.
- `docs/market-research/runs/2026-11-06/analysis.*` and `docs/market-research/history.json`:
  regenerated, because the coverage changed. `REPORT.md` and the baseline analysis were not
  touched.

**Tests:**
- `DevPath.Api.Tests/SeederTests.cs`;
- `DevPath.Api.Tests/DevPath.Api.Tests.csproj`;
- the new list of the topics before the update,
  `DevPath.Api.Tests/TestData/topics-before-linkedin-update.txt`.

**Documentation:**
- `README.md`: the counts are now 166 topics and 648 English videos, plus a paragraph in the
  research section;
- this report;
- the gap analysis;
- the LinkedIn source document.

**Migrations:** none. See "Conflicts" below.

## Tests

| | Before | After |
|---|---|---|
| Backend (xUnit) | 222 passed | 225 passed (3 new) |
| Frontend (Vitest) | 82 passed | 82 passed |
| Frontend build (`ng build`) | — | succeeded |

**The 3 new backend tests:**
- `Topics_added_from_the_linkedin_research_are_complete_and_placed_by_their_prerequisites` checks
  each new topic:
  - every required field is filled in both languages;
  - it has a code sample, a resource, prerequisites and demand data;
  - it sits at the exact position planned between existing topics.
- `Slugs_and_titles_are_unique_and_every_earlier_topic_is_still_in_its_phase` checks two things:
  - no slug or title is repeated (case-insensitive);
  - each of the 159 earlier topics is still present, in its original phase.
- `Inserting_the_new_topics_keeps_existing_progress_and_starts_them_not_started` seeds a copy of
  the content without the new topics, records completed progress on topics around the insertion
  points, then applies the update. It checks that:
  - the ids are unchanged;
  - the progress stays completed;
  - the new topics have no progress, so they show as not started.

**Tests that already existed:**
- `Every_prerequisite_comes_earlier_in_the_roadmap` and `SeedContent.Validate` rule out cycles and
  prerequisites placed later in the roadmap.
- `Seeds_the_full_roadmap` checks every topic for its videos, quizzes, Arabic text and code
  sample.

**Real SQL Server:** the API was started against the local SQL Server database, which held the
previous 159-topic roadmap. It seeded 166 topics, with the new ones at the planned positions
(for example, phase 7 now starts with `web-html-css` 1, `web-javascript-essentials` 2 and
`ts-types-inference` 3), and with their videos, quizzes and demand rows. Kubernetes is now
Important.

**Videos:** each of the 23 video ids was confirmed with YouTube oEmbed, which returns the title and
channel only for public videos that allow embedding. Nothing else was checked, as the owner
asked: no durations, descriptions or relevance review.

**Not done:** a signed-in browser check of the pages. The roadmap needs an approved account, and
the local database has no progress data or test account. The topic page and its component test
were not changed. Every new field is one the existing UI already renders.

## Conflicts with the prompt, and the decisions taken

- **The prompt asks for an EF Core migration with `Down()`.** The content is seed JSON that is
  upserted by slug, so no migration was written. To roll back, revert the commit. The seeder
  never deletes topics, so existing progress stays safe either way.
- **The prompt asks for tags.** There is no tags field; `skill` and `priority` play that role.
- **Demand figures.** The LinkedIn data has aggregates only. It is saved as a cited source, and the
  `why` texts that quote it name LinkedIn as the source. The demand cards in the app still use the
  Indeed run, which has per-posting data.
- **JavaScript code sample.** The JavaScript sample is stored as `.ts`, because the app's
  highlighter and snippet loader don't have a JavaScript language. The code is plain JavaScript,
  which is also valid TypeScript.
- **No Arabic videos.** No Arabic videos were added, as the owner asked. 84 of the 166 topics have
  an Arabic video, which still meets the "at least half" rule.

## Final checklist (section I)

- [x] I inspected the real roadmap before deciding anything (alias scan of all 159 topics, see the gap analysis).
- [x] No topic was added that already existed under any alias.
- [x] Shallow topics were enhanced in place, not duplicated (9 topics).
- [x] New items were inserted by dependency, not appended. The only topic at the end of a phase is `arch-message-brokers`, which depends on the last topic of that phase.
- [x] No existing item was deleted, renamed, re-keyed or moved to another phase (tested against the list of the 159 earlier topics).
- [x] User progress is intact (automated test, and the update ran on a real SQL Server database).
- [x] The design system, components and conventions were reused; no UI or library changes.
- [x] All builds and tests pass; new data-integrity tests were added.
- [x] Both `docs/roadmap-gap-analysis.md` and `docs/roadmap-implementation-report.md` exist.

## Open questions for the owner

1. Should the branch be merged and deployed? It has not been merged or pushed.
2. Should Arabic videos be found for the 7 new topics later?
3. The "Job-market demand" card for each new topic shows the Indeed figures. Should it also show
   the LinkedIn figures? That would need per-posting LinkedIn data.

# Roadmap gap analysis: LinkedIn research (2026-11-06)

This compares the technologies in the LinkedIn summary
([docs/market-research/sources/2026-11-06-linkedin-summary.md](market-research/sources/2026-11-06-linkedin-summary.md))
with the roadmap as it is on `main` at commit `f8676f0`: 14 phases and 159 topics. Percentages are
out of the 25 LinkedIn postings.

**Status: waiting for approval.** Nothing in the roadmap has been changed yet. Step 2.4 of the
prompt asks to stop here.

## How the roadmap is built

These facts decide how new topics can be inserted.

- **Where the content lives.** All roadmap content is in
  `backend/DevPath.Api/SeedData/roadmap/NN-*.json`, one file per phase. There is one source only;
  there is no copy inside the Angular app. The material attached to a topic sits next to it and
  is keyed by the topic slug:
  - `videos.json`
  - `quizzes/*.json`
  - `snippets/topics/<slug>.*`
  - `resources.json`
  - `practice/*.json`
  - `market-demand.json`
- **Item model.** A topic has these fields:
  - `slug`, `skill`, `priority` (Core, Important or Optional), `minutes`, `difficulty`;
  - title, summary, why, how, example, practice and challenge, each in English and Arabic;
  - `objectivesEn` and `objectivesAr`;
  - `prerequisites`, a list of slugs.
- **Order.** A topic's order is its position in the phase file. The seeder renumbers `Order` on
  every start-up and upserts topics by slug, so the `Id` of an existing topic never changes.
- **Progress.** `TopicProgress` points to `TopicId`, not to a position. Inserting a topic in the
  middle of a phase does not affect anyone's progress. A test already checks this:
  `Seeding_twice_creates_no_duplicates_and_keeps_user_progress`.
- **No schema change.** Every field the prompt asks for already exists:
  - exercises are the `practice` field plus the Practice Lab;
  - the mini project is the `challenge` field;
  - the time estimate is `minutes`.

  So no migration is needed, and there is no `Down()` to write.
- **Checks every new topic must pass** (`SeederTests` and `SeedContent.Validate`):
  - a title and summary in Arabic;
  - a code sample;
  - at least 3 quiz questions;
  - 2–4 English videos with real YouTube IDs, and at most 2 Arabic ones; at least half of all
    topics must keep an Arabic video (84 of 159 do today);
  - prerequisites placed earlier in the roadmap;
  - a `skill` the code already defines.

  The phase count stays at 14, because the tests and the onboarding tour depend on it.
- **Baseline before any change:**
  - backend: 222 tests passed;
  - frontend: 82 tests in 14 files passed. On the first run one file failed while the API was
    still building in parallel; it passed on the rerun.

## Checklist (section E of the prompt)

**Status values:**
- **adequate:** a dedicated topic covers the technology properly.
- **shallow:** the technology is only mentioned inside other topics.
- **absent:** no topic covers it.

**Effort values:**
- **S:** text added to an existing topic.
- **M:** a new topic with Arabic text, a quiz, a code sample and 2–4 English videos found and
  checked with YouTube oEmbed.

| # | Topic | Priority | LinkedIn | Status | Existing topics | Planned action | Position | Effort |
|---|---|---|---|---|---|---|---|---|
| 1 | Git workflows | Critical | 60% | adequate | Phase 11, all 9 topics (`git-branching`, `git-merging`, `git-conflicts`, `git-pull-requests`…) | None | — | — |
| 2 | CI/CD | Critical | 60% | adequate | `devops-ci-cd` (GitHub Actions and Azure DevOps) | None | — | — |
| 3 | TypeScript | Critical | 40% | adequate | Phase 7, 11 topics, covering generics and narrowing | None | — | — |
| 3a | JavaScript | not in the checklist | 40% | **absent** | Only "TypeScript is JavaScript with types" in `ts-types-inference`. The previous research mapped it there to fill a report, but nothing teaches it. | **Add `web-javascript-essentials`:** DOM, events, `fetch`, modules, closures and the event loop | Phase 7, after `web-html-css`, before `ts-types-inference` | M |
| 3b | HTML/CSS | not in the checklist | 36% | **absent** | `ng-templates-binding` uses HTML; no topic teaches HTML or CSS | **Add `web-html-css`:** semantic HTML, forms, the box model, Flexbox and Grid, responsive layout, accessibility | Phase 7, first topic | M |
| 4 | Docker | Critical | 44% | adequate | `devops-docker` (multi-stage builds, Compose) | None | — | — |
| 5 | Azure | Critical | 52% | adequate | `cloud-fundamentals`, `cloud-azure-app-service` (App Service, Azure SQL, Key Vault, Functions) | None | — | — |
| 6 | SQL Server depth | Critical | 44% (family) | adequate, but design is shallow | `sql-stored-procedures`, `sql-indexing`, `sql-execution-plans`, `sql-query-efficiency`, `sql-tables-keys` | **Enhance `sql-tables-keys`:** add normalization (1NF–3NF) and when to denormalize; the word "normalization" appears nowhere today | In place | S |
| 7 | Unit testing | Critical | 32% | adequate | `test-unit-csharp` (xUnit), `test-mocking` (Moq, NSubstitute), `test-angular-components` (Vitest) | None | — | — |
| 8 | SOLID and design patterns | Critical | 28% and 40% | adequate | `oop-solid`, `arch-design-patterns` | None | — | — |
| 9 | Microservices | High | 40% | adequate | `arch-microservices` | None | — | — |
| 10 | Agile/Scrum | High | 52% | adequate | `pro-agile-scrum` (Scrum, user stories, Jira) | None | — | — |
| 11 | Kubernetes | High | 32% | adequate | `devops-kubernetes` (priority Optional) | **Enhance:** change the priority from Optional to Important. 32% of postings ask for it, and 20% list it as mandatory. The slug and position stay. | In place | S |
| 12 | Clean / Onion Architecture | High | 20% (family 28%) | **absent** | Nothing matches "clean architecture", "onion", "hexagonal" or "layered" | **Add `arch-clean-architecture`:** layers, the dependency rule, Onion and Clean compared with N-tier, an introduction to CQRS with MediatR (row 24), and testing each layer | Phase 12, after `pro-refactoring` | M |
| 13 | Message brokers | High | 20% | shallow | `arch-microservices` names RabbitMQ, MassTransit, outbox and idempotent consumers in one paragraph | **Add `arch-message-brokers`:** RabbitMQ exchanges (direct, topic, fanout), routing keys, acks, durability, retries, dead-letter queues, publisher and consumer patterns (the BlackStone eIT list), plus when to use Kafka or Azure Service Bus. The mechanics are new, so it overlaps `arch-microservices` well under 50%. | Phase 13, after `arch-microservices` | M |
| 14 | Authentication and authorization | High | 28% (family) | adequate for JWT; shallow for SSO, OIDC and Keycloak | `api-authentication`, `api-authorization`, `fs-auth-flow` | **Enhance `api-authentication` and `fs-auth-flow`:** OAuth 2.0 and OpenID Connect, SSO through an identity provider (Entra ID, Keycloak), and when to use cookies or tokens. Section A says not to make OAuth/OIDC a standalone topic. | In place | S |
| 15 | Domain-Driven Design | High | 16% | **absent** | Only "value object" in `cs-records` | **Add `arch-domain-driven-design`:** entities, value objects, aggregates, domain events, bounded contexts, ubiquitous language | Phase 12, after `arch-clean-architecture` | M |
| 16 | Event-driven architecture | High | 16% | shallow | `arch-microservices` covers integration events and outbox | **Do not add a separate topic.** It would overlap `arch-microservices` and `arch-message-brokers` by more than 50%. Retries, dead-letter queues and saga go into `arch-message-brokers`; domain events go into DDD. | — | — |
| 17 | AI in .NET | High | 12% (family 28%) | **absent** | Nothing matches "LLM", "OpenAI", "Semantic Kernel" or "RAG" | **Add `ai-dotnet-llm`:** calling a model from .NET (`Microsoft.Extensions.AI`, Azure OpenAI), prompts and structured output, RAG with embeddings, cost and safety. This is learning content and is separate from the AI assistant feature of the site that was postponed. | Phase 13, after `cloud-azure-app-service` | M |
| 17a | AI-assisted development | High | 12% | absent | — | **Enhance `pro-code-review`:** review and take ownership of AI-generated code with the same checklist, never paste secrets, check licences | In place | S |
| 18 | Integration testing | Medium | 8% | shallow | `test-integration` (SQLite or a test database), `test-api` mentions `WebApplicationFactory` | **Enhance `test-integration`:** `WebApplicationFactory` with a real SQL Server in Testcontainers | In place | S |
| 19 | Caching / Redis | Medium | 8% | shallow | `sql-query-efficiency` (IMemoryCache), `arch-design-patterns` | **Enhance `pro-performance`:** IMemoryCache, HybridCache, Redis as a distributed cache, output caching and invalidation. 8% is too little for a new topic. | In place | S |
| 20 | PostgreSQL | Medium | 12% | absent | — | **Enhance `sql-data-access-design`:** one paragraph on switching EF Core to PostgreSQL (Npgsql) and what differs. Optional, so no new topic. | In place | S |
| 21 | Dapper | Medium | 8% | adequate | `sql-data-access-design` | Covered by the same edit as row 20 (a Dapper query example) | In place | — |
| 22 | Legacy and migration | Medium | 36% (family) | **absent** | Nothing matches "MVC", ".NET Framework", "WebForms", "AngularJS" or "WCF" | **Add `dotnet-legacy-modernization`:** reading ASP.NET MVC 5, Web API 2 and WebForms code, the .NET Upgrade Assistant, the strangler-fig pattern, consuming SOAP/WCF from .NET, and notes on moving from AngularJS to Angular. The family is at 36% (32% mandatory), so a dedicated topic is justified. | Phase 12, after `arch-domain-driven-design` | M |
| 23 | Observability | Medium | 8% | shallow | `api-logging`, `pro-logging-diagnostics` (no structured-logging library, no OpenTelemetry) | **Enhance `pro-logging-diagnostics`:** Serilog structured logging, OpenTelemetry traces and metrics, Seq, Grafana or ELK, health checks | In place | S |
| 24 | CQRS | Medium | 4% | shallow | `arch-design-patterns` mentions MediatR | Covered inside `arch-clean-architecture` (row 12) | — | — |
| 25 | RxJS | Medium | 4% | adequate | `ng-rxjs`, `ng-search-pagination` (`switchMap`) | None | — | — |
| 26 | Async and concurrency | Medium | 4% | adequate | `cs-async-await`, `cs-cancellation-tokens`, `sql-concurrency` | None | — | — |
| 27 | LINQ | Medium | 16% | adequate | `linq-fundamentals`, `linq-advanced`, `linq-deferred-execution`, `ef-iqueryable-ienumerable` | None | — | — |
| 28 | DI and middleware | Medium | 4% | adequate | `api-dependency-injection`, `api-service-lifetimes`, `api-middleware` | None | — | — |
| 29 | Python | Low | 16% | absent | — | **Not added.** It is outside a .NET full-stack path. | — | — |
| 30 | Low-priority electives | Low | 1–3 postings each | absent; AWS is mentioned in `cloud-fundamentals` | — | **Not added.** None meets the bar for even a mention. | — | — |

## Summary of the plan

**7 new topics.** This takes the roadmap from 159 to 166 topics. No phase is added and no topic
moves to another phase.

| New topic | Phase | Inserted after | Prerequisites | Skill | Difficulty |
|---|---|---|---|---|---|
| `web-html-css` | 7 TypeScript | the start of the phase | `cs-project-structure` | TypeScript | Beginner |
| `web-javascript-essentials` | 7 TypeScript | `web-html-css` | `web-html-css`, `cs-methods` | TypeScript | Beginner |
| `arch-clean-architecture` | 12 Professional | `pro-refactoring` | `arch-design-patterns`, `api-dependency-injection`, `ef-dbcontext`, `test-mocking` | AspNetCore | Intermediate |
| `arch-domain-driven-design` | 12 Professional | `arch-clean-architecture` | `arch-clean-architecture`, `cs-records` | AspNetCore | Advanced |
| `dotnet-legacy-modernization` | 12 Professional | `arch-domain-driven-design` | `pro-reading-codebases`, `pro-refactoring`, `test-integration` | AspNetCore | Intermediate |
| `ai-dotnet-llm` | 13 Cloud & DevOps | `cloud-azure-app-service` | `cloud-azure-app-service`, `api-configuration` | DevOps | Intermediate |
| `arch-message-brokers` | 13 Cloud & DevOps | `arch-microservices` | `arch-microservices` | AspNetCore | Advanced |

**9 existing topics enhanced in place:**
- `sql-tables-keys`
- `devops-kubernetes` (priority only)
- `api-authentication`
- `fs-auth-flow`
- `pro-code-review`
- `test-integration`
- `pro-performance`
- `sql-data-access-design`
- `pro-logging-diagnostics`

None of them changes its slug, title or position.

**Not added:**
- event-driven architecture as its own topic (overlap);
- OAuth/OIDC as its own topic (the prompt's own rule);
- caching, PostgreSQL and CQRS as their own topics (low evidence, covered as sections);
- Python;
- the electives.

The existing prerequisite lists are left alone. For example, `ts-types-inference` does not get
the new JavaScript topic as a prerequisite, so no learner finds an existing topic locked
because of a new one.

## Where this prompt and the codebase differ

| Prompt | Codebase | Decision |
|---|---|---|
| Write an EF Core migration with `Down()` that inserts rows | The content is seed JSON, upserted by slug when the API starts | Edit the JSON. No migration. Rolling back means reverting the commit; the seeder never deletes topics, so existing progress is unaffected either way. |
| Store the demand figure on the item | The demand cards come from `market-demand.json`, produced by the toolkit from per-posting data | The LinkedIn data has aggregates only, so it is saved as a cited source document and not as a toolkit run. `why` texts that quote a LinkedIn percentage name LinkedIn as the source. |
| Add tags (category and priority) | No tags field; `skill` and `priority` play that role | Use `skill` and `priority`. |
| Add JWT, OAuth and OIDC as a dedicated item | Section A says not to add OAuth/OIDC as a standalone item from this research | Enhance the existing authentication topics. |

## Data-integrity tests to add during implementation

- No two topics share a slug or a title (case-insensitive).
- The 159 existing slugs are all still present, in the same phase.
- Every new topic has a summary, objectives, practice, challenge, difficulty and minutes in both
  languages, a quiz, a code sample and videos.
- The existing test `Every_prerequisite_comes_earlier_in_the_roadmap` already rules out cycles,
  because every prerequisite must come earlier in the roadmap.

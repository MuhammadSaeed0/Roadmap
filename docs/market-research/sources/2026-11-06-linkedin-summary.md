# LinkedIn job-posting summary (supplied 2026-11-06)

**Source:** supplied by the repository owner as part of the prompt
`VSCode_Roadmap_Implementation_Prompt.md`. Only aggregates were supplied. There are no records
for individual postings, so this summary is **not** a toolkit run: it is not under `runs/` and
does not feed `SeedData/market-demand.json`. The demand cards in the app still come from the
Indeed run of 2026-11-06.

**Method, as stated by the supplier:** real LinkedIn postings from the last 90 days. The
searches covered Egypt, the Middle East (UAE, Saudi Arabia), Europe (Portugal, Italy, Austria,
Poland) and remote roles. Each posting was opened and its full description read. Requirements
were classified as mandatory, preferred, or one of several alternatives.

| | |
|---|---|
| Verified postings | 25, from 22 companies (2 more were excluded because they did not ask for .NET) |
| Regions | Egypt 8, Middle East 7, Europe 6, Remote 4 |
| Seniority | Senior 14, Mid 6, Mid-Senior 1, Lead 2, Junior 2 |
| Caveat | Each posting is 4% of the sample. Use the numbers for ranking only. |

**Core stack:** C# 88%, ASP.NET Core 88%, SQL Server 80%, REST APIs 68%, Angular 56%,
React 16%, EF Core 32%, ASP.NET MVC 24%.

## Most requested technologies outside the core stack

| Technology | Postings (of 25) | Demand | Mandatory | Preferred |
|---|---|---|---|---|
| Git | 15 | 60% | 60% | 0% |
| CI/CD | 15 | 60% | 44% | 16% |
| Agile/Scrum | 13 | 52% | 44% | 8% |
| Azure | 13 | 52% | 32% | 20% |
| Docker | 11 | 44% | 28% | 16% |
| TypeScript | 10 | 40% | 40% | 0% |
| JavaScript | 10 | 40% | 36% | 4% |
| Design Patterns | 10 | 40% | 32% | 8% |
| Microservices | 10 | 40% | 32% | 8% |
| HTML/CSS | 9 | 36% | 36% | 0% |
| Unit Testing | 8 | 32% | 32% | 0% |
| Kubernetes | 8 | 32% | 20% | 12% |
| SOLID | 7 | 28% | 24% | 4% |
| SQL Query Optimization | 7 | 28% | 20% | 8% |
| Stored Procedures | 6 | 24% | 24% | 0% |
| Azure DevOps | 6 | 24% | 8% | 16% |
| Message broker (any) | 5 | 20% | 20% | 0% |
| Clean Architecture | 5 | 20% | 16% | 4% |
| LINQ, T-SQL, DDD, Event-Driven, RabbitMQ, Python, React | 4 each | 16% | 8–16% | 0–8% |
| Database Design, AI dev tools, AI/LLM integration, PostgreSQL, Distributed Systems | 3 each | 12% | 4–12% | 0–8% |

## Families

A posting counts once in a family if it names any member of that family.

| Family | Postings | Demand | Mandatory |
|---|---|---|---|
| Any cloud | 14 | 56% | 32% |
| Containers | 11 | 44% | 32% |
| SQL depth (stored procedures, T-SQL, optimisation, design) | 11 | 44% | 40% |
| Legacy .NET (MVC, WebForms, .NET Framework, VB.NET, WCF, IIS, jQuery) | 9 | 36% | 32% |
| Automated testing | 8 | 32% | 32% |
| Advanced architecture (Clean, Onion, DDD, CQRS, Vertical Slice) | 7 | 28% | 24% |
| Security and authentication (JWT, SSO, Keycloak, secure coding) | 7 | 28% | 20% |
| AI (LLM, RAG, Semantic Kernel, Azure OpenAI, AI tools) | 7 | 28% | 20% |
| Messaging (RabbitMQ, Kafka, SQS, Service Bus, MQTT) | 5 | 20% | 20% |
| Caching (Redis) | 2 | 8% | 4% |
| Observability (OpenTelemetry, Prometheus, Grafana, ELK) | 2 | 8% | 4% |

**Searched for, but found in none of the 25 postings:** gRPC, SignalR, NgRx, Angular Material,
Tailwind, Jest, Playwright, Terraform, GitHub Actions, Moq, Selenium, Cypress, OAuth 2.0/OIDC by
name, Duende IdentityServer, and "database indexing" by name.

The supplier's notes on individual postings (for example, the RabbitMQ requirements at
BlackStone eIT, and the AngularJS migration at HUXE and Lumicode) are kept in the prompt file.
They are quoted in `docs/roadmap-gap-analysis.md` only where they justify a decision.

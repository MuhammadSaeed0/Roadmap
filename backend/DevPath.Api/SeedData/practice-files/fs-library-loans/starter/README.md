# Capstone: library loans system

A community library wants to stop using paper cards. Members borrow up to 3 books for 14 days; late returns cost 2 EGP per day; members with unpaid fines over 50 EGP can’t borrow. Librarians need an overdue report.

## Suggested structure

```
backend/  Api, Domain (Book, Member, Loan rules), Infrastructure (EF Core), Tests (unit + integration)
frontend/ src/app (books, members, loans, overdue-report)
docs/     README with setup, architecture diagram and decisions
.github/  workflows/ci.yml (build + test)
```

## API contract

```http
GET  /api/books?search=&available=true&page=     → 200
POST /api/members/{id}/loans { bookId }         → 201 | 404 | 409 (not available / limit reached / member blocked)
POST /api/loans/{id}/return                     → 200 { fine } | 404 | 409 (already returned)
GET  /api/reports/overdue                       → 200
```

## Your notes

- Decisions:
- Open questions:

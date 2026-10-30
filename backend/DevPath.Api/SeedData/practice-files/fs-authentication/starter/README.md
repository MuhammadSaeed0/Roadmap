# Authentication from login form to protected API

A notes app is about to go public. Each user must register, log in, see only their own data and be sent back to the login page when their session ends.

## Suggested structure

```
backend/  Api (AuthController, Users table, PasswordHasher, JWT or cookie auth)
frontend/ src/app (auth/login, auth/register, core/auth.service, core/auth.interceptor, core/auth.guard)
```

## API contract

```http
POST /api/auth/register { email, password }  → 201 | 400 | 409
POST /api/auth/login    { email, password }  → 200 { token, expiresAt } | 401
GET  /api/auth/me                              → 200 { email, roles } | 401
POST /api/auth/logout                          → 204
```

## Your notes

- Decisions:
- Open questions:

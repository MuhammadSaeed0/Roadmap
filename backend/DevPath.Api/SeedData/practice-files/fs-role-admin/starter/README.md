# Role-based admin panel with an audit log

The shop now has staff: Admins manage users, Support can view any order but change nothing, Auditors read the audit log. Every sensitive action must be traceable.

## Suggested structure

```
backend/  Api (policies, AdminController, AuditLog, resource-based authorization handlers)
frontend/ src/app (admin/users, admin/audit-log, core/has-role directive, role guards)
```

## API contract

```http
GET    /api/admin/users?search=&role=&page=   → 200 (Admin)
PUT    /api/admin/users/{id}/roles { roles }  → 204 (Admin) | 400 (can’t remove the last admin)
POST   /api/admin/users/{id}/lock             → 204 (Admin, not yourself)
GET    /api/admin/audit?page=                 → 200 (Admin, Auditor)
GET    /api/orders/{id}                       → 200 (owner, Support, Admin) | 404
```

## Your notes

- Decisions:
- Open questions:

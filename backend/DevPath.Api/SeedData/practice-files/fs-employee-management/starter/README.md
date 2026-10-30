# Employee management system

A small company tracks its staff in a spreadsheet. HR wants a web app to add, edit, search and remove employees and see them by department.

## Suggested structure

```
backend/  Api (Controllers, Services, Dtos, Data, Migrations)
frontend/ src/app (employees/list, employees/form, departments, core/api)
database: Employees, Departments
```

## API contract

```http
GET    /api/employees?search=&departmentId=&page=1&pageSize=10   → 200 { items, total }
GET    /api/employees/{id}                                        → 200 | 404
POST   /api/employees                                             → 201 | 400 | 409 (email taken)
PUT    /api/employees/{id}                                        → 204 | 400 | 404
DELETE /api/employees/{id}                                        → 204 | 404
GET    /api/departments                                           → 200
```

## Your notes

- Decisions:
- Open questions:

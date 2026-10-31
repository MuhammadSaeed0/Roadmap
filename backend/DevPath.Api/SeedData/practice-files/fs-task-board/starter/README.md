# Team task board with concurrent edits

A team of five uses a Kanban board. When two people edit the same task at the same time, one person’s change disappears without anyone noticing.

## Suggested structure

```
backend/  Api (BoardsController, TasksController, Task.RowVersion)
frontend/ src/app (board, board/column, board/task-card, board/task-dialog)
```

## API contract

```http
GET   /api/boards/{id}            → 200 { columns: [{ id, name, tasks: [{ id, title, assignee, version }] }] }
POST  /api/boards/{id}/tasks      → 201
PATCH /api/tasks/{id} { columnId?, title?, assignee?, version } → 200 { version } | 404 | 409 { current }
```

## Your notes

- Decisions:
- Open questions:

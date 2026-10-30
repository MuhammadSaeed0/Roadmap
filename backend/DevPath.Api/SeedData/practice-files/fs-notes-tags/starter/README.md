# Notes app with tags

You want a personal notes app: write notes, tag them, filter by tag and search, with autosave while typing.

## Suggested structure

```
backend/  Api (NotesController, TagsController, Note–Tag many-to-many)
frontend/ src/app (notes/list, notes/editor, notes/tag-filter)
```

## API contract

```http
GET    /api/notes?tag=&search=   → 200 [{ id, title, excerpt, tags, updatedAt }]
GET    /api/notes/{id}           → 200 { id, title, body, tags, updatedAt }
POST   /api/notes { title, body, tags: ["work"] } → 201
PUT    /api/notes/{id}           → 204
DELETE /api/notes/{id}           → 204
GET    /api/tags                 → 200 [{ name, count }]
```

## Your notes

- Decisions:
- Open questions:

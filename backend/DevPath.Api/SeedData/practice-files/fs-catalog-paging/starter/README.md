# Product catalog with server-side paging and filtering

The shop now has 50,000 products and the catalog page loads all of them, taking 8 seconds. Customers want to search, filter by category and price, sort and page.

## Suggested structure

```
backend/  Api (ProductsController, ProductQuery, PagedResult<T>, indexes)
frontend/ src/app (catalog/catalog-page, catalog/filters, shared/pager)
database: Products (50,000 seeded rows), Categories
```

## API contract

```http
GET /api/products?search=&categoryId=&minPrice=&maxPrice=&sort=name|price|-price|newest&page=1&pageSize=20
    → 200 { items: [{ id, name, price, category, imageUrl }], page, pageSize, total }
GET /api/categories → 200
```

## Your notes

- Decisions:
- Open questions:

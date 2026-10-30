# Sales reporting dashboard

Managers export orders to Excel every Monday to see revenue per month and best-selling products. They want a dashboard with a date range.

## Suggested structure

```
backend/  Api (ReportsController, ReportService with grouped queries or a view)
frontend/ src/app (dashboard, dashboard/kpi-card, dashboard/sales-chart, dashboard/date-range)
```

## API contract

```http
GET /api/reports/summary?from=2026-01-01&to=2026-03-31     → 200 { revenue, orders, averageOrder, newCustomers }
GET /api/reports/sales-by-month?from=&to=                → 200 [{ month, revenue, orders }]
GET /api/reports/top-products?from=&to=&take=5           → 200 [{ product, quantity, revenue }]
```

## Your notes

- Decisions:
- Open questions:

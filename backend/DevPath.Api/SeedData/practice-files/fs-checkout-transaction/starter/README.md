# Checkout as one transaction

During a sale, some orders were saved without lines, stock went negative, and double-clicking "Pay" created two orders. Checkout must be all-or-nothing and safe to retry.

## Suggested structure

```
backend/  Api (CheckoutController, CheckoutService, Orders, OrderLines, Products.Stock, Payments)
frontend/ src/app (cart, checkout, order-confirmation)
```

## API contract

```http
POST /api/checkout { items: [{ productId, quantity }], idempotencyKey }
    → 201 { orderId, total } | 400 | 409 { outOfStock: [productId] }
```

## Your notes

- Decisions:
- Open questions:

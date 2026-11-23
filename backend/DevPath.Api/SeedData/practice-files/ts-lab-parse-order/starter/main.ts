// The contract of GET /api/orders/{id} (JSON, camelCase, enums as strings, dates in ISO 8601):
// { "id": 42, "status": "Shipped", "total": 199.5, "createdAt": "2026-11-20T09:30:00Z", "customerEmail": "sara@example.com" }

type OrderStatus = 'Pending' | 'Shipped' | 'Cancelled';

interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  customerEmail: string | null;
}

// Validate an unknown JSON value against the contract and convert it to an Order.
// Throw Error('Invalid field: <name>') for the first field that is missing or has the wrong type or value.
// customerEmail may be missing or null (it becomes null).
function parseOrder(json: unknown): Order {
  return json as Order;
}

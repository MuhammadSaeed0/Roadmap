type OrderStatus = 'Pending' | 'Shipped' | 'Cancelled';

interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  customerEmail: string | null;
}

const STATUSES: readonly OrderStatus[] = ['Pending', 'Shipped', 'Cancelled'];

function parseOrder(json: unknown): Order {
  if (typeof json !== 'object' || json === null) throw new Error('Invalid field: body');
  const o = json as Record<string, unknown>;
  const fail = (name: string): never => { throw new Error('Invalid field: ' + name); };

  if (typeof o['id'] !== 'number' || !Number.isInteger(o['id'])) fail('id');
  if (typeof o['status'] !== 'string' || !STATUSES.includes(o['status'] as OrderStatus)) fail('status');
  if (typeof o['total'] !== 'number' || o['total'] < 0) fail('total');
  const createdAt = typeof o['createdAt'] === 'string' ? new Date(o['createdAt']) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) fail('createdAt');
  const email = o['customerEmail'];
  if (email !== undefined && email !== null && typeof email !== 'string') fail('customerEmail');

  return {
    id: o['id'] as number,
    status: o['status'] as OrderStatus,
    total: o['total'] as number,
    createdAt: createdAt!,
    customerEmail: (email as string | null | undefined) ?? null,
  };
}

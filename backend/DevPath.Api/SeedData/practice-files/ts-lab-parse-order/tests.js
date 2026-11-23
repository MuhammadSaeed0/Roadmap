const valid = { id: 42, status: 'Shipped', total: 199.5, createdAt: '2026-11-20T09:30:00Z', customerEmail: 'sara@example.com' };

test('a valid order is converted, with a real Date', () => {
  const order = parseOrder(valid);
  expect(order.id).toBe(42);
  expect(order.status).toBe('Shipped');
  expect(order.createdAt instanceof Date).toBe(true);
  expect(order.createdAt.toISOString()).toBe('2026-11-20T09:30:00.000Z');
});

test('a missing or null email becomes null', () => {
  const { customerEmail, ...noEmail } = valid;
  expect(parseOrder(noEmail).customerEmail).toBe(null);
  expect(parseOrder({ ...valid, customerEmail: null }).customerEmail).toBe(null);
});

test('wrong types are rejected with the field name', () => {
  expect(() => parseOrder({ ...valid, id: '42' })).toThrow('Invalid field: id');
  expect(() => parseOrder({ ...valid, total: '199.5' })).toThrow('Invalid field: total');
});

test('an enum number or an unknown status is rejected', () => {
  expect(() => parseOrder({ ...valid, status: 1 })).toThrow('Invalid field: status');
  expect(() => parseOrder({ ...valid, status: 'shipped' })).toThrow('Invalid field: status');
});

test('a date that is not ISO 8601 is rejected', () => {
  expect(() => parseOrder({ ...valid, createdAt: 'yesterday' })).toThrow('Invalid field: createdAt');
  expect(() => parseOrder(null)).toThrow('Invalid field');
});

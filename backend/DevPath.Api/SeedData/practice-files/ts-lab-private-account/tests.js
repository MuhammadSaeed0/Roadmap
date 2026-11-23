test('deposit and withdraw change the balance', () => {
  const account = new Account('A-1', 100);
  account.deposit(50);
  account.withdraw(30);
  expect(account.balance).toBe(120);
});

test('withdrawing more than the balance throws', () => {
  const account = new Account('A-1', 100);
  expect(() => account.withdraw(101)).toThrow('Insufficient funds');
  expect(account.balance).toBe(100);
});

test('amounts must be positive', () => {
  const account = new Account('A-1', 100);
  expect(() => account.deposit(0)).toThrow();
  expect(() => account.withdraw(-5)).toThrow();
});

test('the balance is private at runtime: only id is a public field', () => {
  const account = new Account('A-1', 100);
  expect(Object.keys(account)).toEqual(['id']);
  try { account.balance = 999; } catch (e) { /* a getter without a setter */ }
  expect(account.balance).toBe(100);
});

test('Thousands separator and two decimals', () => expect(formatPrice(1234.5)).toBe('EGP 1,234.50'));
test('Another currency', () => expect(formatPrice(9.99, 'USD')).toBe('USD 9.99'));
test('Negative amounts', () => expect(formatPrice(-5)).toBe('-EGP 5.00'));
test('Rounds to two decimals', () => expect(formatPrice(0.125)).toBe('EGP 0.13'));

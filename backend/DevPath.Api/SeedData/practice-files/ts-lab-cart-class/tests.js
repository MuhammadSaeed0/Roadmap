test('Same product adds up', () => { const c = new Cart(); c.add('Mouse', 15.99, 2); c.add('Mouse', 15.99); expect(c.count()).toBe(3); expect(c.total()).toBe(47.97); });
test('Remove a product', () => { const c = new Cart(); c.add('A', 10); c.add('B', 5); c.remove('A'); expect(c.total()).toBe(5); });
test('Rejects bad quantities and prices', () => { const c = new Cart(); expect(() => c.add('A', 10, 0)).toThrow(); expect(() => c.add('A', 10, 1.5)).toThrow(); expect(() => c.add('A', -1)).toThrow(); });
test('Empty cart', () => { const c = new Cart(); expect(c.total()).toBe(0); expect(c.count()).toBe(0); });

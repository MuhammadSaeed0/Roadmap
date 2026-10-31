test('Works as a callback', () => { const c = new Counter(); [1, 2, 3].forEach(c.increment); expect(c.value).toBe(3); });
test('Works when called directly', () => { const c = new Counter(); c.increment(); expect(c.value).toBe(1); });
test('Each counter is separate', () => { const a = new Counter(); const b = new Counter(); a.increment(); expect(b.value).toBe(0); });

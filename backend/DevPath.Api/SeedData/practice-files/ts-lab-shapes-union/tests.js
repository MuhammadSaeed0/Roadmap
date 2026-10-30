test('Rectangle area', () => expect(area({ kind: 'rect', width: 2, height: 3 })).toBe(6));
test('Circle area', () => expect(area({ kind: 'circle', radius: 1 })).toBeCloseTo(Math.PI, 5));
test('Square area', () => expect(area({ kind: 'square', side: 4 })).toBe(16));
test('Describe a circle', () => expect(describe({ kind: 'circle', radius: 1 })).toBe('circle with radius 1'));

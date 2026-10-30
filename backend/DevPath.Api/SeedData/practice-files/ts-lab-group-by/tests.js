test('Groups objects by a key', () => expect(groupBy(products, p => p.category).Audio.map(p => p.name)).toEqual(['Headset', 'Speakers']));
test('Works with numbers', () => expect(groupBy([1, 2, 3, 4], n => n % 2 === 0 ? 'even' : 'odd')).toEqual({ odd: [1, 3], even: [2, 4] }));
test('Empty input gives an empty object', () => expect(groupBy([], x => x)).toEqual({}));

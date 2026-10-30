test('Active users, sorted', () => expect(activeUserNames(users)).toEqual(['Mona', 'Sara']));
test('Users who never logged in', () => expect(neverLoggedIn(users).map(u => u.name)).toEqual(['Omar']));
test('Empty list', () => expect(activeUserNames([])).toEqual([]));

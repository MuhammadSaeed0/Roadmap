const replay = (events) => events.reduce((s, e) => reduce(s, e), { status: 'idle' });

test('first load: spinner, then the list', () => {
  const loading = replay([{ type: 'start', requestId: 1 }]);
  expect(view(loading)).toBe('spinner');
  const ready = reduce(loading, { type: 'success', requestId: 1, data: ['a'] });
  expect(ready).toEqual({ status: 'ready', data: ['a'] });
  expect(view(ready)).toBe('list');
});

test('refreshing keeps the old list visible', () => {
  const state = replay([{ type: 'start', requestId: 1 }, { type: 'success', requestId: 1, data: ['a'] }, { type: 'start', requestId: 2 }]);
  expect(state).toEqual({ status: 'loading', requestId: 2, previous: ['a'] });
  expect(view(state)).toBe('list+spinner');
});

test('a failed refresh shows the error next to the old list', () => {
  const state = replay([
    { type: 'start', requestId: 1 }, { type: 'success', requestId: 1, data: ['a'] },
    { type: 'start', requestId: 2 }, { type: 'failure', requestId: 2, message: 'Offline' },
  ]);
  expect(state).toEqual({ status: 'error', message: 'Offline', previous: ['a'] });
  expect(view(state)).toBe('list+error');
  expect(view(replay([{ type: 'start', requestId: 1 }, { type: 'failure', requestId: 1, message: 'x' }]))).toBe('error');
});

test('a late answer to an older request is ignored', () => {
  const state = replay([
    { type: 'start', requestId: 1 }, { type: 'start', requestId: 2 },
    { type: 'success', requestId: 2, data: ['new'] }, { type: 'success', requestId: 1, data: ['old'] },
  ]);
  expect(state).toEqual({ status: 'ready', data: ['new'] });
});

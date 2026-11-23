test('defaults produce a clean URL', () => {
  expect(toQueryParams({ q: '', categoryId: null, page: 1, pageSize: 20 })).toEqual({});
});

test('only changed values go to the URL', () => {
  expect(toQueryParams({ q: '  mouse ', categoryId: 3, page: 2, pageSize: 20 })).toEqual({ q: 'mouse', categoryId: '3', page: '2' });
});

test('reading the URL back gives the same state', () => {
  const state = { q: 'mouse', categoryId: 3, page: 2, pageSize: 50 };
  expect(fromQueryParams(toQueryParams(state))).toEqual(state);
});

test('invalid URL values fall back to the defaults', () => {
  expect(fromQueryParams({ page: '-4', pageSize: '1000', categoryId: 'abc' })).toEqual({ q: '', categoryId: null, page: 1, pageSize: 20 });
  expect(fromQueryParams({ page: '2.5' }).page).toBe(1);
});

test('a new search goes back to page 1', () => {
  expect(withSearch({ q: 'mouse', categoryId: 3, page: 4, pageSize: 10 }, 'cable')).toEqual({ q: 'cable', categoryId: 3, page: 1, pageSize: 10 });
});

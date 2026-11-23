const fakeFetch = (users) => async (url) => {
  const id = Number(url.split('/').pop());
  const user = users[id];
  return user
    ? { ok: true, status: 200, json: async () => user }
    : { ok: false, status: 404, json: async () => ({}) };
};

test('once calls the function a single time', () => {
  let calls = 0;
  const init = once(() => ++calls);
  expect(init()).toBe(1);
  expect(init()).toBe(1);
  expect(calls).toBe(1);
});

test('each counter keeps its own private count', () => {
  const a = makeCounter();
  const b = makeCounter(10);
  a.increment(); a.increment(); b.increment();
  expect(a.current()).toBe(2);
  expect(b.current()).toBe(11);
  expect(Object.keys(a).includes('count')).toBe(false);
});

test('loadUserName awaits the response and reads the JSON', async () => {
  expect(await loadUserName(fakeFetch({ 7: { name: 'Mona' } }), 7)).toBe('Mona');
});

test('loadUserName throws for an error status', async () => {
  let message = null;
  try { await loadUserName(fakeFetch({}), 99); } catch (e) { message = e.message; }
  expect(message).toBe('HTTP 404');
});

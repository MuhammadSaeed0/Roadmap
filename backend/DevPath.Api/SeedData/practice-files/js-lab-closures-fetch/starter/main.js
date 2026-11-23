// 1. once(fn): a function that calls fn the first time only and returns that first result every time.
function once(fn) {
  return fn;
}

// 2. makeCounter(start): an object with increment() and current(); the count is private (a closure).
function makeCounter(start = 0) {
  return { count: start, increment() {}, current() { return 0; } };
}

// 3. loadUserName(fetchFn, id): GET /api/users/{id} with the given fetch function and return the user's name.
//    When the response is not ok, throw new Error('HTTP ' + status).
async function loadUserName(fetchFn, id) {
  const response = fetchFn('/api/users/' + id);
  return response.name;
}

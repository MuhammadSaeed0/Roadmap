function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

function makeCounter(start = 0) {
  let count = start;
  return {
    increment() { count++; return count; },
    current() { return count; },
  };
}

async function loadUserName(fetchFn, id) {
  const response = await fetchFn('/api/users/' + id);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const user = await response.json();
  return user.name;
}

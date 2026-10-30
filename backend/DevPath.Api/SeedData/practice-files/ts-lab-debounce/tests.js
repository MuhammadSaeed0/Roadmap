const sleep = ms => new Promise(r => setTimeout(r, ms));
test('Calls once with the latest arguments', async () => { const calls = []; const d = debounce(x => calls.push(x), 30); for (let i = 1; i <= 5; i++) d(i); await sleep(80); expect(calls).toEqual([5]); });
test('Calls again after a pause', async () => { const calls = []; const d = debounce(x => calls.push(x), 20); d('a'); await sleep(60); d('b'); await sleep(60); expect(calls).toEqual(['a', 'b']); });
test('Does not call immediately', () => { let called = false; debounce(() => { called = true; }, 20)(); expect(called).toBe(false); });

const flaky = failures => { let calls = 0; const fn = async () => { calls++; if (calls <= failures) throw new Error('fail ' + calls); return 'ok'; }; fn.calls = () => calls; return fn; };
test('Succeeds after failures', async () => { const fn = flaky(2); expect(await retry(fn, 3, 10)).toBe('ok'); expect(fn.calls()).toBe(3); });
test('Rejects with the last error', async () => { let message = ''; try { await retry(flaky(5), 2, 10); } catch (e) { message = e.message; } expect(message).toBe('fail 2'); });
test('No retry when the first call works', async () => { const fn = flaky(0); await retry(fn, 3, 10); expect(fn.calls()).toBe(1); });

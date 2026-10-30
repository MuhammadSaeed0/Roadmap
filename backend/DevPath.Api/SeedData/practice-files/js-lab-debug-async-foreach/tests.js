test('Adds every price', async () => expect(await cartTotal([1, 2, 3])).toBe(89.97));
test('Runs in parallel', async () => { const t = Date.now(); await cartTotal([1, 2, 3]); expect(Date.now() - t < 250).toBeTruthy(); });
test('Empty cart', async () => expect(await cartTotal([])).toBe(0));

test('Valid JSON', () => expect(parseJson('[1,2]')).toEqual({ ok: true, value: [1, 2] }));
test('Invalid JSON does not throw', () => { const r = parseJson('{oops'); expect(r.ok).toBe(false); expect(typeof r.error).toBe('string'); });
test('Empty text', () => expect(parseJson('  ').ok).toBe(false));

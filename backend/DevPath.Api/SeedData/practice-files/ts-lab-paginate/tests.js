const data = Array.from({ length: 25 }, (_, i) => i + 1);
test('Last page', () => { const p = paginate(data, 3, 10); expect(p.items).toEqual([21, 22, 23, 24, 25]); expect(p.totalPages).toBe(3); expect(p.hasNext).toBe(false); expect(p.hasPrevious).toBe(true); });
test('Clamps the page number', () => { expect(paginate(data, 0, 10).page).toBe(1); expect(paginate(data, 99, 10).page).toBe(3); });
test('Empty list has one empty page', () => { const p = paginate([], 1, 10); expect(p.totalPages).toBe(1); expect(p.items).toEqual([]); });
test('Rejects a page size of 0', () => expect(() => paginate(data, 1, 0)).toThrow());

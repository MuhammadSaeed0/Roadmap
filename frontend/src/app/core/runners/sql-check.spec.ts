import { compareResult, parseSqlChecks } from './sql-check';

const set = (rows: unknown[][], columns = ['a', 'b']) => ({ columns, rows, truncated: false });

describe('compareResult', () => {
  it('matches equal rows in any order unless order matters', () => {
    const check = { nameEn: 'x', nameAr: 'x', expected: { rows: [[1, 'A'], [2, 'B']] } };
    expect(compareResult(set([[2, 'B'], [1, 'A']]), check)).toBeNull();
    expect(compareResult(set([[2, 'B'], [1, 'A']]), { ...check, ordered: true })).toBe('order');
  });

  it('treats 49.990 and "49.99" as the same value and compares NULLs', () => {
    const check = { nameEn: 'x', nameAr: 'x', expected: { rows: [[49.99, null]] } };
    expect(compareResult(set([['49.990', null]]), check)).toBeNull();
  });

  it('explains what is wrong', () => {
    const check = { nameEn: 'x', nameAr: 'x', expected: { columns: ['a', 'b'], rows: [[1, 'A']] } };
    expect(compareResult(undefined, check)).toBe('noResult');
    expect(compareResult(set([[1]], ['a']), check)).toBe('columnCount');
    expect(compareResult(set([[1, 'A'], [2, 'B']]), check)).toBe('rowCount');
    expect(compareResult(set([[1, 'Z']]), check)).toBe('values');
  });
});

describe('parseSqlChecks', () => {
  it('reads a spec and tolerates bad input', () => {
    expect(parseSqlChecks('{"checks":[{"nameEn":"n","nameAr":"n","expected":{"rows":[]}}]}')).toHaveLength(1);
    expect(parseSqlChecks('not json')).toEqual([]);
    expect(parseSqlChecks(null)).toEqual([]);
  });
});

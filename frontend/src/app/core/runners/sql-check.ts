import { SqlResultSet } from './runner-host.service';

/**
 * Automatic checks of a SQL exercise (practice-files/{key}/tests.json). Each check compares a result set with
 * the expected rows: either the last result of the learner's own SQL, or the result of a check query run
 * after it (for INSERT/UPDATE/CREATE tasks). Only the expected rows are stored, never the solution.
 */
export interface SqlCheck {
  nameEn: string;
  nameAr: string;
  /** Run after the learner's SQL; omitted = check the learner's last result set. */
  sql?: string;
  expected: { columns?: string[]; rows: unknown[][] };
  /** Whether row order matters (it does when the task asks for ORDER BY). */
  ordered?: boolean;
}

export interface SqlCheckSpec { checks: SqlCheck[]; }

export function parseSqlChecks(tests: string | null | undefined): SqlCheck[] {
  if (!tests) return [];
  try {
    const spec = JSON.parse(tests) as SqlCheckSpec;
    return Array.isArray(spec.checks) ? spec.checks : [];
  } catch {
    return [];
  }
}

function normalize(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
  if (typeof value === 'boolean') return value ? '1' : '0';
  const text = String(value).trim();
  return /^-?\d+(\.\d+)?$/.test(text) ? normalize(Number(text)) : text;
}

/** Returns null when the result matches, or a short reason for the learner. */
export function compareResult(actual: SqlResultSet | undefined, check: SqlCheck): string | null {
  if (!actual) return 'noResult';
  const expected = check.expected;
  if (expected.columns && actual.columns.length !== expected.columns.length) return 'columnCount';
  const rows = actual.rows.map(r => r.map(normalize).join('\u0001'));
  const want = expected.rows.map(r => r.map(normalize).join('\u0001'));
  if (rows.length !== want.length) return 'rowCount';
  const same = check.ordered
    ? rows.every((r, i) => r === want[i])
    : [...rows].sort().every((r, i) => r === [...want].sort()[i]);
  if (same) return null;
  if (!check.ordered) return 'values';
  return [...rows].sort().every((r, i) => r === [...want].sort()[i]) ? 'order' : 'values';
}

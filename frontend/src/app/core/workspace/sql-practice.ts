/**
 * Practice data for SQL lesson examples that create their own tables. Those open in an empty database (the tables
 * would clash with a sample database), so without help the learner would create a table and see nothing. This adds,
 * after the lesson's code, a few rows that fit the columns the lesson defined, and a SELECT to show them. A table the
 * example refers to but doesn't create (Enrollments → Students) gets a small stand-in first, so the code runs.
 */

interface Column { name: string; type: string; identity: boolean; hasDefault: boolean; ref: string | null; }
interface Table { name: string; columns: Column[]; }

const ROWS = 4;
const NL = '\n';
const NAMES = ['Mona Ali', 'Omar Hassan', 'Sara Adel', 'Youssef Nabil'];
const CITIES = ['Cairo', 'Giza', 'Alexandria', 'Mansoura'];
const TITLES = ['Intro to Programming', 'Databases', 'Web Development', 'Algorithms'];

/** CREATE TABLE statements in the example, with their columns. */
export function parseCreateTables(sql: string): Table[] {
  const tables: Table[] = [];
  const clean = sql.replace(/--[^\n]*/g, '');
  for (const m of clean.matchAll(/CREATE\s+TABLE\s+(?:dbo\.)?\[?(\w+)\]?\s*\(/gi)) {
    // The column list: up to the bracket that closes the one after the table name.
    let depth = 1, i = m.index + m[0].length;
    const start = i;
    for (; i < clean.length && depth > 0; i++) depth += clean[i] === '(' ? 1 : clean[i] === ')' ? -1 : 0;
    const body = clean.slice(start, i - 1);
    const parts: string[] = [];
    let level = 0, current = '';
    for (const ch of body) {
      if (ch === ',' && level === 0) { parts.push(current); current = ''; continue; }
      level += ch === '(' ? 1 : ch === ')' ? -1 : 0;
      current += ch;
    }
    parts.push(current);
    const columns = parts.map(p => p.trim()).filter(p => p && !/^(PRIMARY|FOREIGN|UNIQUE|CONSTRAINT|CHECK|INDEX)\b/i.test(p)).map(p => {
      const [, name, type] = p.match(/^\[?(\w+)\]?\s+(\w+)/) ?? [];
      return { name, type: (type ?? '').toUpperCase(), identity: /\bIDENTITY\b/i.test(p), hasDefault: /\bDEFAULT\b/i.test(p),
        ref: p.match(/\bREFERENCES\s+(?:dbo\.)?\[?(\w+)/i)?.[1] ?? null };
    }).filter(c => c.name);
    tables.push({ name: m[1], columns });
  }
  return tables;
}

function value(column: Column, row: number): string {
  const n = column.name.toLowerCase();
  const t = column.type;
  if (column.ref) return String((row % 3) + 1);
  if (/CHAR|TEXT/.test(t)) {
    if (n.includes('email')) return `'${NAMES[row].split(' ')[0].toLowerCase()}@example.com'`;
    if (n.includes('city')) return `N'${CITIES[row]}'`;
    if (n.includes('title') || n.includes('course')) return `N'${TITLES[row]}'`;
    if (n.includes('name')) return `N'${NAMES[row]}'`;
    return `N'${column.name} ${row + 1}'`;
  }
  if (/DATE|TIME/.test(t)) return `'2025-0${row + 1}-15'`;
  if (t === 'BIT') return String(row % 2);
  if (/DECIMAL|NUMERIC|MONEY|FLOAT|REAL/.test(t)) {
    if (n.includes('gpa')) return ['3.40', '2.95', '3.80', 'NULL'][row];
    if (n.includes('price') || n.includes('amount') || n.includes('total')) return ['49.99', '120.00', '15.50', 'NULL'][row];
    return ((row + 1) * 10.5).toFixed(2);
  }
  if (n === 'id') return String(row + 1);
  if (n.includes('year')) return String((row % 4) + 1);
  if (n.includes('hour')) return String([3, 4, 6, 8][row]);
  if (n.includes('grade') || n.includes('score')) return String([85, 72, 91, 64][row]);
  return String(row + 1);
}

/** Headings for the added parts, in the reader's language. */
export interface PracticeHeadings { before: string; after: string; }

const DEFAULT_HEADINGS: PracticeHeadings = {
  before: '-- Tables the example refers to, added so it runs:',
  after: '-- Practice data, added so you can try the example:',
};

/** What to add around the example: stand-in tables before it, rows and a SELECT after it. Empty when it creates no table. */
export function practiceData(sql: string): { before: string[]; after: string[] } {
  const tables = parseCreateTables(sql);
  if (tables.length === 0) return { before: [], after: [] };
  const created = new Set(tables.map(t => t.name.toLowerCase()));
  const missing = [...new Set(tables.flatMap(t => t.columns.map(c => c.ref)).filter((r): r is string => !!r && !created.has(r.toLowerCase())))];
  const before = missing.map(r => [
    `CREATE TABLE ${r} (Id INT PRIMARY KEY, Name NVARCHAR(100) NOT NULL);`,
    `INSERT INTO ${r} (Id, Name) VALUES ${[0, 1, 2].map(i => `(${i + 1}, N'${(r.toLowerCase().includes('course') ? TITLES : NAMES)[i]}')`).join(', ')};`,
  ].join(NL));
  const after: string[] = [];
  for (const table of tables) {
    const cols = table.columns.filter(c => !c.identity && !c.hasDefault);
    if (cols.length === 0) continue;
    // Composite keys made of two references (Enrollments: StudentId, CourseId) need distinct pairs.
    const refs = cols.filter(c => c.ref);
    const pairs = [[1, 1], [1, 2], [2, 1], [3, 2]];
    const rows = Array.from({ length: ROWS }, (_, row) => cols.map(c => {
      const k = refs.indexOf(c);
      return refs.length === 2 && k >= 0 ? String(pairs[row][k]) : value(c, row);
    }));
    after.push(`INSERT INTO ${table.name} (${cols.map(c => c.name).join(', ')}) VALUES${NL}  ${rows.map(r => `(${r.join(', ')})`).join(`,${NL}  `)};`);
    after.push(`SELECT * FROM ${table.name};`);
  }
  return { before, after };
}

/** The example with its practice data: stand-in tables first, then the lesson's code, then rows and a SELECT. */
export function withPracticeData(sql: string, headings: PracticeHeadings = DEFAULT_HEADINGS): string {
  const { before, after } = practiceData(sql);
  if (before.length === 0 && after.length === 0) return sql;
  const head = before.length ? headings.before + NL + before.join(NL + NL) + NL + NL : '';
  const tail = after.length ? NL + NL + headings.after + NL + after.join(NL) + NL : NL;
  return head + sql.trimEnd() + tail;
}

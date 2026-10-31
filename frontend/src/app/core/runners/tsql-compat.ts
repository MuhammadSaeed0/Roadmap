/**
 * The Practice Lab's SQL engine is SQLite running in the browser, while the roadmap teaches SQL Server.
 * This rewrites the SQL Server syntax beginners meet most often into its SQLite equivalent before a query
 * runs, and reports every change so the learner always knows what actually ran. Text inside strings,
 * comments and [quoted identifiers] is never changed.
 */
export interface TsqlConversion {
  /** i18n key under playground.sqlNotes, e.g. 'top' */
  code: string;
  /** What was converted, e.g. 'TOP (3) → LIMIT 3' */
  detail: string;
}

export interface TsqlRewrite { sql: string; conversions: TsqlConversion[]; }

type Token = { kind: 'code' | 'string' | 'comment' | 'quoted'; text: string };

/** Splits SQL into code, string literals, comments and quoted identifiers. */
export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let code = '';
  const flush = () => { if (code) { tokens.push({ kind: 'code', text: code }); code = ''; } };
  for (let i = 0; i < sql.length;) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === '-' && next === '-') {
      const end = sql.indexOf('\n', i);
      const stop = end < 0 ? sql.length : end;
      flush(); tokens.push({ kind: 'comment', text: sql.slice(i, stop) }); i = stop;
    } else if (c === '/' && next === '*') {
      const end = sql.indexOf('*/', i + 2);
      const stop = end < 0 ? sql.length : end + 2;
      flush(); tokens.push({ kind: 'comment', text: sql.slice(i, stop) }); i = stop;
    } else if (c === "'" || ((c === 'N' || c === 'n') && next === "'" && !/[A-Za-z0-9_]/.test(sql[i - 1] ?? ''))) {
      let j = c === "'" ? i + 1 : i + 2;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") { j++; break; }
        else j++;
      }
      flush(); tokens.push({ kind: 'string', text: sql.slice(i, j) }); i = j;
    } else if (c === '[' || c === '"') {
      const close = c === '[' ? ']' : '"';
      const end = sql.indexOf(close, i + 1);
      const stop = end < 0 ? sql.length : end + 1;
      flush(); tokens.push({ kind: 'quoted', text: sql.slice(i, stop) }); i = stop;
    } else {
      code += c; i++;
    }
  }
  flush();
  return tokens;
}

/** Splits into statements on ';' and on lines that only say GO (outside strings and comments). */
function statements(tokens: Token[]): Token[][] {
  const result: Token[][] = [[]];
  for (const token of tokens) {
    if (token.kind !== 'code') { result[result.length - 1].push(token); continue; }
    const parts = token.text.split(/(;|^[ \t]*GO[ \t]*(?:\r?\n|$))/im);
    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        if (part === ';') result[result.length - 1].push({ kind: 'code', text: ';' });
        result.push([]);
      } else if (part) {
        result[result.length - 1].push({ kind: 'code', text: part });
      }
    });
  }
  return result.filter(s => s.some(t => t.kind !== 'code' || t.text.trim()));
}

const replacements: { code: string; pattern: RegExp; replace: (m: RegExpExecArray) => string; show?: (m: RegExpExecArray, out: string) => string }[] = [
  {
    code: 'identity',
    pattern: /\b(?:BIG)?INT\s+IDENTITY\s*(?:\(\s*\d+\s*,\s*\d+\s*\))?\s+(?:NOT\s+NULL\s+)?PRIMARY\s+KEY\b/gi,
    replace: () => 'INTEGER PRIMARY KEY AUTOINCREMENT',
  },
  { code: 'identityOther', pattern: /\bIDENTITY\s*(?:\(\s*\d+\s*,\s*\d+\s*\))?/gi, replace: () => '' },
  { code: 'now', pattern: /\b(?:GETDATE|SYSDATETIME|GETUTCDATE|SYSUTCDATETIME)\s*\(\s*\)/gi, replace: () => 'CURRENT_TIMESTAMP' },
  { code: 'isnull', pattern: /\bISNULL\s*\(/gi, replace: () => 'IFNULL(' },
  { code: 'len', pattern: /\bLEN\s*\(/gi, replace: () => 'LENGTH(' },
  { code: 'newid', pattern: /\bNEWID\s*\(\s*\)/gi, replace: () => 'lower(hex(randomblob(16)))' },
  { code: 'stringAgg', pattern: /\bSTRING_AGG\s*\(/gi, replace: () => 'group_concat(' },
  {
    code: 'datePart',
    pattern: /\b(YEAR|MONTH|DAY)\s*\(([^()]*)\)/gi,
    replace: m => `CAST(strftime('${({ YEAR: '%Y', MONTH: '%m', DAY: '%d' } as Record<string, string>)[m[1].toUpperCase()]}', ${m[2].trim()}) AS INTEGER)`,
  },
  { code: 'max', pattern: /\(\s*MAX\s*\)/gi, replace: () => '' },
  { code: 'dbo', pattern: /\bdbo\s*\./gi, replace: () => '' },
  { code: 'tran', pattern: /\b(BEGIN|COMMIT|ROLLBACK)\s+TRAN\b(?!SACTION)/gi, replace: m => `${m[1].toUpperCase()} TRANSACTION` },
  {
    code: 'offsetFetch',
    pattern: /\bOFFSET\s+(\d+)\s+ROWS?\s+FETCH\s+(?:NEXT|FIRST)\s+(\d+)\s+ROWS?\s+ONLY\b/gi,
    replace: m => `LIMIT ${m[2]} OFFSET ${m[1]}`,
  },
];

export function rewriteTsql(sql: string): TsqlRewrite {
  const conversions: TsqlConversion[] = [];
  const note = (code: string, detail: string) => {
    if (!conversions.some(c => c.code === code && c.detail === detail)) conversions.push({ code, detail });
  };

  const out: string[] = [];
  for (const statement of statements(tokenize(sql))) {
    const codeText = statement.filter(t => t.kind === 'code').map(t => t.text).join(' ');

    // USE and CREATE DATABASE: the browser engine has one database per workspace.
    if (/^\s*(USE\s+\S+|CREATE\s+DATABASE\s+\S+)\s*;?\s*$/i.test(codeText)) {
      note('database', codeText.trim().replace(/;$/, ''));
      continue;
    }

    // PRINT 'text' → SELECT 'text' AS Message
    let tokens = statement.map(t => ({ ...t }));
    const first = tokens.find(t => t.kind !== 'comment' && t.text.trim());
    if (first?.kind === 'code' && /^\s*PRINT\b/i.test(first.text)) {
      first.text = first.text.replace(/^(\s*)PRINT\b/i, '$1SELECT');
      const last = [...tokens].reverse().find(t => t.kind !== 'comment' && t.text.trim());
      if (last) last.text = last.text.replace(/(\s*;?\s*)$/, ' AS Message$1');
      note('print', 'PRINT → SELECT … AS Message');
    }

    // SELECT [DISTINCT] TOP (n) … → SELECT [DISTINCT] … LIMIT n (statement level only).
    const head = tokens.find(t => t.kind === 'code' && t.text.trim());
    const top = head && /^(\s*SELECT\s+(?:DISTINCT\s+)?)TOP\s*\(?\s*(\d+)\s*\)?(?!\s*PERCENT)\s*/i.exec(head.text);
    if (head && top && tokens.indexOf(head) === tokens.findIndex(t => t.kind !== 'comment' && t.text.trim())) {
      head.text = top[1] + head.text.slice(top[0].length);
      const lastCode = [...tokens].reverse().find(t => t.kind === 'code' && t.text.trim());
      if (lastCode) lastCode.text = lastCode.text.replace(/(\s*;?\s*)$/, ` LIMIT ${top[2]}$1`);
      note('top', `TOP ${top[2]} → LIMIT ${top[2]}`);
    }

    tokens = tokens.map(t => {
      if (t.kind === 'string' && /^[Nn]'/.test(t.text)) { note('unicode', "N'…' → '…'"); return { ...t, text: t.text.slice(1) }; }
      if (t.kind !== 'code') return t;
      let text = t.text;
      for (const r of replacements) {
        text = text.replace(r.pattern, (...args) => {
          const match = args.slice(0, -2) as unknown as RegExpExecArray;
          const replaced = r.replace(match);
          note(r.code, `${match[0].replace(/\s+/g, ' ').trim()} → ${replaced || '(removed)'}`);
          return replaced;
        });
      }
      return { ...t, text };
    });
    out.push(tokens.map(t => t.text).join(''));
  }

  let result = out.map(s => s.trim()).filter(Boolean).map(s => (s.endsWith(';') ? s : s + ';')).join('\n');
  if (!result) result = '';
  return { sql: result, conversions };
}

/** Explains common SQLite errors caused by SQL Server-only syntax. Returns an i18n key under playground.sqlHints. */
export function sqlErrorHint(message: string): string | null {
  if (/near "TOP"|near "PERCENT"/i.test(message)) return 'top';
  if (/no such function: (DATEADD|DATEDIFF|FORMAT|CONVERT|CHARINDEX|GETDATE|DATENAME)/i.test(message)) return 'function';
  if (/near "\+"|datatype mismatch/i.test(message)) return 'concat';
  if (/FOREIGN KEY constraint failed/i.test(message)) return 'foreignKey';
  if (/UNIQUE constraint failed/i.test(message)) return 'unique';
  if (/NOT NULL constraint failed/i.test(message)) return 'notNull';
  if (/no such table/i.test(message)) return 'table';
  if (/no such column/i.test(message)) return 'column';
  return null;
}

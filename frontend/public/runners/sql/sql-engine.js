// SQL engine worker: SQLite compiled to WebAssembly (sql.js), running in the learner's browser.
// The app rewrites common SQL Server syntax (TOP, IDENTITY, GETDATE() ...) before sending it here.
//
// in:  { id, action: 'run', sql, setup?, fresh?, checks? }   run statements (on a fresh copy of the sample data when fresh)
//      { id, action: 'schema' }                             describe the current tables
//      { id, action: 'reset', setup? }                       start again from the sample data
// out: { id, type: 'result', result } | { id, type: 'error', message } | { type: 'ready' } | { type: 'fatal', message }
'use strict';

importScripts(self.RUNNER_BASE + 'sql/sql-wasm.js');

const MAX_ROWS = 1000;
let SQL;
let db;
let currentSetup = '';

function open(setup) {
  if (db) db.close();
  db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  currentSetup = setup || '';
  if (currentSetup) db.exec(currentSetup);
}

function cell(value) {
  if (value instanceof Uint8Array) return '(binary, ' + value.length + ' bytes)';
  return value;
}

/** Runs every statement in order and reports a result set or a "rows affected" message for each. */
function runStatements(sql) {
  const results = [];
  const messages = [];
  let index = 0;
  for (const statement of db.iterateStatements(sql)) {
    index++;
    try {
      const columns = statement.getColumnNames();
      if (columns.length > 0) {
        const rows = [];
        let truncated = false;
        while (statement.step()) {
          if (rows.length >= MAX_ROWS) { truncated = true; break; }
          rows.push(statement.get().map(cell));
        }
        results.push({ columns, rows, truncated });
        messages.push('(' + rows.length + (truncated ? '+' : '') + ' row' + (rows.length === 1 ? '' : 's') + ')');
      } else {
        statement.step();
        const changed = db.getRowsModified();
        const text = statement.getSQL().trim().split(/\s+/)[0].toUpperCase();
        messages.push(['INSERT', 'UPDATE', 'DELETE'].includes(text)
          ? '(' + changed + ' row' + (changed === 1 ? '' : 's') + ' affected)'
          : text + ' completed');
      }
    } catch (error) {
      error.statementIndex = index;
      error.statementSql = statement.getSQL();
      throw error;
    } finally {
      statement.free();
    }
  }
  return { results, messages };
}

function query(sql) {
  const out = db.exec(sql);
  return out.map((r) => ({ columns: r.columns, rows: r.values.map((row) => row.map(cell)), truncated: false }));
}

function schema() {
  const tables = query("SELECT name, sql FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0];
  if (!tables) return [];
  return tables.rows.map(([name]) => {
    const quoted = '"' + String(name).replace(/"/g, '""') + '"';
    const columns = (query('PRAGMA table_info(' + quoted + ')')[0]?.rows ?? [])
      .map(([, column, type, notNull, , pk]) => ({ name: column, type: type || '', notNull: !!notNull, primaryKey: pk > 0 }));
    const foreignKeys = (query('PRAGMA foreign_key_list(' + quoted + ')')[0]?.rows ?? [])
      .map(([, , table, from, to]) => ({ column: from, references: table + '(' + to + ')' }));
    const rowCount = query('SELECT COUNT(*) FROM ' + quoted)[0].rows[0][0];
    return { name, columns, foreignKeys, rowCount };
  });
}

function handle(data) {
  switch (data.action) {
    case 'run': {
      if (data.fresh || !db || (data.setup !== undefined && data.setup !== currentSetup)) open(data.setup);
      const started = performance.now();
      let outcome;
      let error = null;
      try {
        outcome = runStatements(data.sql || '');
      } catch (e) {
        outcome = { results: [], messages: [] };
        error = { message: String(e.message || e), statementIndex: e.statementIndex ?? null, statement: e.statementSql ?? null };
      }
      let checkResults = null;
      if (!error && Array.isArray(data.checks) && data.checks.length) {
        try { checkResults = data.checks.map((check) => query(check)[0] ?? { columns: [], rows: [], truncated: false }); }
        catch (e) { checkResults = null; error = { message: 'Check query failed: ' + String(e.message || e), statementIndex: null, statement: null }; }
      }
      return { ...outcome, error, checkResults, durationMs: Math.round(performance.now() - started), schema: schema() };
    }
    case 'schema':
      if (!db) open('');
      return schema();
    case 'reset':
      open(data.setup ?? currentSetup);
      return schema();
    default:
      throw new Error('Unknown action ' + data.action);
  }
}

// The WebAssembly file comes from the app's cache through the runner host (see runners/host.js).
const wasmUrl = self.RUNNER_BASE + 'sql/sql-wasm.wasm';
(self.runnerFetch ? self.runnerFetch(wasmUrl) : fetch(wasmUrl))
  .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error('HTTP ' + response.status))))
  .then((wasmBinary) => initSqlJs({ wasmBinary, locateFile: (file) => self.RUNNER_BASE + 'sql/' + file }))
  .then((module) => {
    SQL = module;
    self.onmessage = (event) => {
      if (event.data && event.data.type === 'asset') return;   // answered by the asset bridge
      const { id } = event.data;
      try { self.postMessage({ id, type: 'result', result: handle(event.data) }); }
      catch (e) { self.postMessage({ id, type: 'error', message: String(e.message || e) }); }
    };
    self.postMessage({ type: 'ready' });
  })
  .catch((e) => self.postMessage({ type: 'fatal', message: 'Could not load the SQL engine: ' + String(e.message || e) }));

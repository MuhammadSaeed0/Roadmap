// Verifies the Practice Lab exercises that the browser checks automatically, with the same code the browser uses:
//   SQL:        the T-SQL → SQLite rewrite, sql.js and compareResult from src/app/core/runners
//   JavaScript: public/runners/js/js-engine.js (TypeScript is compiled first, as the editor does)
// Each model solution (starter files overlaid with the solution files) must pass every check, and each starter
// must not, or the exercise would be solved before the learner starts. C# exercises are verified by
// backend/DevPath.Api.Tests (PracticeExerciseTests).
//
// Run: npm run verify:exercises   (Node 24+, which runs the imported .ts files directly)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = join(frontend, '..', 'backend', 'DevPath.Api', 'SeedData');
const require = createRequire(join(frontend, 'package.json'));
const ts = require('typescript');
const initSqlJs = require('sql.js');
const { rewriteTsql } = await import('../src/app/core/runners/tsql-compat.ts');
const { SQL_DATASETS } = await import('../src/app/core/runners/sql-datasets.ts');
const { parseSqlChecks, compareResult } = await import('../src/app/core/runners/sql-check.ts');
const SQL = await initSqlJs({ locateFile: f => join(frontend, 'node_modules', 'sql.js', 'dist', f) });
const jsEngine = readFileSync(join(frontend, 'public', 'runners', 'js', 'js-engine.js'), 'utf8');

function readTree(dir) {
  const files = {};
  const walk = d => {
    for (const name of readdirSync(d)) {
      const path = join(d, name);
      if (statSync(path).isDirectory()) walk(path);
      else files[relative(dir, path).split('\\').join('/')] = readFileSync(path, 'utf8');
    }
  };
  if (existsSync(dir)) walk(dir);
  return files;
}

/** Runs the learner's SQL then each check on a fresh copy of the dataset; returns one failure message per check (null = passed). */
function checkSql(dataset, sql, checks) {
  const db = new SQL.Database();
  try {
    db.run('PRAGMA foreign_keys = ON;');
    db.exec(SQL_DATASETS[dataset].setup);
    let results;
    try { results = db.exec(rewriteTsql(sql).sql); } catch (e) { return checks.map(() => String(e.message)); }
    const last = results[results.length - 1];
    return checks.map(check => {
      try {
        const actual = check.sql ? db.exec(check.sql)[0] ?? { columns: [], values: [] } : last;
        return compareResult(actual && { columns: actual.columns, rows: actual.values }, check);
      } catch (e) { return String(e.message); }
    });
  } finally { db.close(); }
}

function compileTs(code) {
  return ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.None, experimentalDecorators: true, useDefineForClassFields: false },
  }).outputText;
}

/** Runs code + tests through js-engine.js in an isolated context, like the browser worker does. */
function checkJs(code, tests) {
  return new Promise((resolve, reject) => {
    const sources = new Map();
    const context = {
      console: { log() {}, info() {}, warn() {}, error() {}, debug() {} },
      performance, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, Promise,
      Blob: class { constructor(parts) { this.text = parts.join(''); } },
      URL: { createObjectURL: blob => { const id = 'blob:' + sources.size; sources.set(id, blob.text); return id; }, revokeObjectURL: id => sources.delete(id) },
      addEventListener() {},
      postMessage: message => { if (message.type === 'result') resolve(message.result); else if (message.type === 'error') reject(new Error(message.message)); },
    };
    context.self = context;
    context.importScripts = id => vm.runInContext(sources.get(id), context, { timeout: 5000 });
    vm.createContext(context);
    vm.runInContext(jsEngine, context);
    context.onmessage({ data: { id: 1, action: 'run', code, tests } });
  });
}

const failures = [];
const counts = { Sql: 0, JavaScript: 0, TypeScript: 0 };
for (const file of readdirSync(join(seed, 'practice')).sort()) {
  for (const exercise of JSON.parse(readFileSync(join(seed, 'practice', file), 'utf8'))) {
    const { key, runner } = exercise;
    if (!(runner in counts)) continue;
    const dir = join(seed, 'practice-files', key);
    const starter = readTree(join(dir, 'starter'));
    const solved = { ...starter, ...readTree(join(dir, 'solution')) };
    const fail = message => failures.push(`${key}: ${message}`);
    counts[runner]++;

    if (runner === 'Sql') {
      const checks = parseSqlChecks(readFileSync(join(dir, 'tests.json'), 'utf8'));
      if (!checks.length) { fail('no checks'); continue; }
      const sqlOf = files => Object.entries(files).filter(([p]) => p.endsWith('.sql')).map(([, c]) => c).join('\n');
      checkSql(exercise.dataset, sqlOf(solved), checks).forEach((m, i) => m && fail(`solution fails "${checks[i].nameEn}": ${m}`));
      if (checkSql(exercise.dataset, sqlOf(starter), checks).every(m => m === null)) fail('the starter already passes every check');
      continue;
    }

    const tests = readFileSync(join(dir, 'tests.js'), 'utf8');
    const ext = runner === 'TypeScript' ? '.ts' : '.js';
    const codeOf = files => Object.entries(files).filter(([p]) => p.endsWith(ext)).map(([, c]) => (ext === '.ts' ? compileTs(c) : c)).join('\n;\n');
    const result = await checkJs(codeOf(solved), tests);
    if (result.error) fail(`solution throws ${result.error}`);
    if ((result.tests?.length ?? 0) < 3) fail('fewer than three checks');
    for (const t of result.tests ?? []) if (!t.passed) fail(`solution fails "${t.name}": ${t.message}`);
    const unsolved = await checkJs(codeOf(starter), tests);
    if (!unsolved.error && unsolved.tests?.every(t => t.passed)) fail('the starter already passes every check');
  }
}

console.log(`Checked ${counts.Sql} SQL, ${counts.JavaScript} JavaScript and ${counts.TypeScript} TypeScript exercises.`);
if (failures.length) {
  console.error(failures.map(f => '  ✗ ' + f).join('\n'));
  process.exit(1);
}
console.log('All model solutions pass their checks and no starter does.');

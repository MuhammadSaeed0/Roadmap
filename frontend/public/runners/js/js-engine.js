// JavaScript engine worker: runs learner JavaScript (or TypeScript the app already compiled) with a tiny
// test framework, in the learner's browser.
//
// in:  { id, action: 'run', code, tests? }
// out: { id, type: 'result', result: { logs, error, tests, durationMs } } | { type: 'ready' }
'use strict';

const MAX_LOGS = 2000;

function show(value, depth = 0) {
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
  if (typeof value === 'bigint') return value + 'n';
  if (value instanceof Error) return value.name + ': ' + value.message;
  if (value instanceof Map) return 'Map(' + value.size + ') ' + show(Object.fromEntries(value), depth + 1);
  if (value instanceof Set) return 'Set(' + value.size + ') ' + show([...value], depth + 1);
  if (value && typeof value === 'object') {
    try { return JSON.stringify(value, (k, v) => typeof v === 'bigint' ? v + 'n' : v); } catch { return String(value); }
  }
  return String(value);
}

function equal(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => equal(a[k], b[k]));
}

function expect(actual) {
  const fail = (text) => { throw Object.assign(new Error(text), { assertion: true }); };
  return {
    toBe: (expected) => { if (!Object.is(actual, expected)) fail('expected ' + show(expected, 1) + ' but got ' + show(actual, 1)); },
    toEqual: (expected) => { if (!equal(actual, expected)) fail('expected ' + show(expected, 1) + ' but got ' + show(actual, 1)); },
    toBeCloseTo: (expected, digits = 2) => { if (Math.abs(expected - actual) >= Math.pow(10, -digits) / 2) fail('expected about ' + expected + ' but got ' + actual); },
    toBeTruthy: () => { if (!actual) fail('expected a truthy value but got ' + show(actual, 1)); },
    toBeFalsy: () => { if (actual) fail('expected a falsy value but got ' + show(actual, 1)); },
    toContain: (item) => { if (!actual || !actual.includes || !actual.includes(item)) fail('expected ' + show(actual, 1) + ' to contain ' + show(item, 1)); },
    toHaveLength: (n) => { if (!actual || actual.length !== n) fail('expected length ' + n + ' but got ' + (actual && actual.length)); },
    toThrow: (text) => {
      try { actual(); } catch (e) {
        if (text && !String(e && e.message).includes(text)) fail('expected an error containing "' + text + '" but got "' + (e && e.message) + '"');
        return;
      }
      fail('expected the function to throw');
    },
  };
}

async function run(data) {
  const logs = [];
  const add = (level, args) => { if (logs.length < MAX_LOGS) logs.push({ level, text: args.map((a) => show(a)).join(' ') }); };
  const original = { ...console };
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) console[level] = (...args) => add(level, args);
  const tests = [];
  self.test = self.it = (name, fn) => tests.push({ name, fn });
  self.expect = expect;
  self.exports = {};
  self.module = { exports: self.exports };
  const started = performance.now();
  let error = null;
  const results = data.tests ? [] : null;
  try {
    // One classic script, so the tests can see the learner's top-level functions and classes.
    const source = (data.code || '') + '\n;\n' + (data.tests || '');
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    try { importScripts(url); } finally { URL.revokeObjectURL(url); }
    for (const t of tests) {
      try { await t.fn(); results?.push({ name: t.name, passed: true, message: null }); }
      catch (e) { results?.push({ name: t.name, passed: false, message: e && e.assertion ? e.message : String((e && e.name) || 'Error') + ': ' + String(e && e.message) }); }
    }
    // Give promises and timers started by the program a moment to log their results.
    await new Promise((resolve) => setTimeout(resolve, 30));
  } catch (e) {
    error = String((e && e.name) || 'Error') + ': ' + String(e && e.message || e);
  } finally {
    Object.assign(console, original);
  }
  return { logs, error, tests: results, durationMs: Math.round(performance.now() - started) };
}

self.addEventListener('error', (event) => { event.preventDefault(); });
self.onmessage = async (event) => {
  const { id } = event.data;
  try { self.postMessage({ id, type: 'result', result: await run(event.data) }); }
  catch (e) { self.postMessage({ id, type: 'error', message: String(e.message || e) }); }
};
self.postMessage({ type: 'ready' });

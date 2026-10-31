// Runner host. Lives in a sandboxed iframe and runs each engine (C#, SQL, JavaScript) in its own Web Worker,
// so a long or endless program can always be stopped by terminating the worker.
//
// Messages from the app:   { channel: 'devpath-runner', id, engine, action: 'run' | 'schema' | 'stop' | 'warmup', payload, timeoutMs }
// Messages to the app:     { channel: 'devpath-runner', id?, engine, type: 'status' | 'result' | 'error', ... }
'use strict';

const CHANNEL = 'devpath-runner';
const base = new URL('./', location.href).href;

// How each engine's worker is started. Workers are created from blob URLs because this document has an
// opaque origin; the scripts they load are fetched from the site with CORS.
const engines = {
  csharp: () => `import(${JSON.stringify(base + 'csharp/worker.js')}).catch(e => postMessage({ type: 'fatal', message: String(e && e.message || e) }));`,
  sql: () => `self.RUNNER_BASE = ${JSON.stringify(base)}; importScripts(${JSON.stringify(base + 'sql/sql-engine.js')});`,
  javascript: () => `self.RUNNER_BASE = ${JSON.stringify(base)}; importScripts(${JSON.stringify(base + 'js/js-engine.js')});`,
};

const state = {};   // engine -> { worker, ready: Promise, pending: Map<id, {resolve, reject, timer}> }

const FRESH_WORKER_PER_RUN = new Set(['javascript']);

function post(message) {
  parent.postMessage({ channel: CHANNEL, ...message }, '*');
}

function start(engine) {
  const blob = new Blob([engines[engine]()], { type: 'text/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  const entry = { worker, pending: new Map() };
  post({ engine, type: 'status', status: 'loading' });
  entry.ready = new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'ready') { post({ engine, type: 'status', status: 'ready' }); resolve(); return; }
      if (data.type === 'fatal') { post({ engine, type: 'status', status: 'failed', message: data.message }); reject(new Error(data.message)); stop(engine); return; }
      const job = entry.pending.get(data.id);
      if (!job) return;
      entry.pending.delete(data.id);
      clearTimeout(job.timer);
      if (data.type === 'error') job.reject(new Error(data.message));
      else job.resolve(data.result);
      if (entry.pending.size === 0) post({ engine, type: 'status', status: 'ready' });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      const message = event.message || 'The runner stopped unexpectedly.';
      post({ engine, type: 'status', status: 'failed', message });
      reject(new Error(message));
      stop(engine, message);
    };
  });
  state[engine] = entry;
  return entry;
}

function stop(engine, reason = 'Stopped.') {
  const entry = state[engine];
  if (!entry) return;
  entry.worker.terminate();
  for (const job of entry.pending.values()) { clearTimeout(job.timer); job.reject(new Error(reason)); }
  delete state[engine];
  post({ engine, type: 'status', status: 'idle' });
}

async function request(engine, action, payload, timeoutMs) {
  const entry = state[engine] ?? start(engine);
  await entry.ready;
  const id = crypto.randomUUID();
  post({ engine, type: 'status', status: 'running' });
  return new Promise((resolve, reject) => {
    // The clock starts once the engine is loaded, so the first download doesn't count as "too slow".
    const timer = setTimeout(() => {
      reject(new Error('timeout'));
      stop(engine, 'timeout');
    }, timeoutMs);
    entry.pending.set(id, { resolve, reject, timer });
    entry.worker.postMessage({ id, action, ...payload });
  });
}

addEventListener('message', async (event) => {
  const data = event.data;
  if (event.source !== parent || !data || data.channel !== CHANNEL || !(data.engine in engines)) return;
  const { id, engine, action } = data;
  if (action === 'stop') { stop(engine); return; }
  try {
    if (action === 'warmup') { await (state[engine] ?? start(engine)).ready; post({ id, engine, type: 'result', result: null }); return; }
    const result = await request(engine, action, data.payload ?? {}, Math.min(Math.max(Number(data.timeoutMs) || 10000, 1000), 120000));
    post({ id, engine, type: 'result', result });
  } catch (error) {
    post({ id, engine, type: 'error', message: String(error && error.message || error) });
  } finally {
    // JavaScript runs as classic scripts sharing one global scope: a second run in the same worker would
    // redeclare the first run's classes and constants (and see its leftovers), so each run gets a new worker.
    if (FRESH_WORKER_PER_RUN.has(engine) && action === 'run') stop(engine);
  }
});

post({ type: 'status', engine: 'host', status: 'ready' });

// Python engine (runs in a Web Worker inside the runner host). CPython compiled to WebAssembly (Pyodide).
//
// in:  { id, action: 'run', files: [{ path, content }], entry?, stdin?, tests? }
// out: { id, type: 'result', result: { output, error, tests, durationMs } } | { type: 'ready' } | { type: 'fatal', message }
//
// Each run writes the learner's files to a fresh folder and runs the entry file in a new namespace, so one run never
// sees another's variables or modules. tests (a Python file) run after the program in the same namespace: every
// top-level function whose name starts with "test" is a check, and a failed assert is reported with its message.
'use strict';

const base = new URL('python/', self.RUNNER_BASE).href;

// Pyodide downloads its WebAssembly module, standard library and package list with fetch: send those requests
// through the app's cache (runnerFetch, from the host), so they are downloaded once, not on every visit.
const plainFetch = self.fetch.bind(self);
self.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  return url.startsWith(base) && self.runnerFetch ? self.runnerFetch(url) : plainFetch(input, init);
};

importScripts(base + 'pyodide.js');

const MAX_OUTPUT = 100000;

// Runs one program and its checks. Written in Python so tracebacks show the learner's own file and line numbers.
const HARNESS = `
import os, sys, shutil, traceback, types

def _devpath_run(folder, entry, tests):
    os.chdir(folder)
    sys.path.insert(0, folder)
    for name in list(sys.modules):
        mod = sys.modules[name]
        if getattr(mod, '__file__', None) and str(mod.__file__).startswith(folder):
            del sys.modules[name]
    ns = {'__name__': '__main__', '__file__': os.path.join(folder, entry)}
    error = None
    try:
        with open(entry, encoding='utf-8') as f:
            code = compile(f.read(), entry, 'exec')
        exec(code, ns)
    except SystemExit:
        pass
    except BaseException:
        error = _devpath_format(sys.exc_info())
    results = None
    if tests is not None and error is None:
        results = []
        try:
            exec(compile(tests, 'tests.py', 'exec'), ns)
        except BaseException:
            return error, [{'name': 'tests.py', 'passed': False, 'message': _devpath_format(sys.exc_info())}]
        for name, fn in list(ns.items()):
            if name.startswith('test') and isinstance(fn, types.FunctionType) and fn.__code__.co_filename == 'tests.py':
                label = (fn.__doc__ or name).strip()
                try:
                    fn()
                    results.append({'name': label, 'passed': True, 'message': None})
                except AssertionError as e:
                    results.append({'name': label, 'passed': False, 'message': str(e) or 'The check failed.'})
                except BaseException as e:
                    results.append({'name': label, 'passed': False, 'message': type(e).__name__ + ': ' + str(e)})
    sys.path.remove(folder)
    os.chdir('/')
    shutil.rmtree(folder, ignore_errors=True)
    return error, results

def _devpath_format(info):
    kind, value, tb = info
    # Keep the learner's frames, not the harness's.
    frames = [f for f in traceback.extract_tb(tb) if f.filename != '<exec>']
    lines = ['Traceback (most recent call last):\\n'] if frames else []
    lines += traceback.format_list(frames)
    lines += traceback.format_exception_only(kind, value)
    return ''.join(lines).rstrip()
`;

let pyodide;
let runs = 0;

async function boot() {
  pyodide = await loadPyodide({ indexURL: base, fullStdLib: false });
  await pyodide.runPythonAsync(HARNESS);
  self.postMessage({ type: 'ready' });
}

async function run(data) {
  const started = performance.now();
  let output = '';
  let truncated = false;
  const write = (text) => {
    if (truncated) return;
    if (output.length + text.length > MAX_OUTPUT) {
      output += text.slice(0, MAX_OUTPUT - output.length);
      truncated = true;
      throw new Error('Output limit reached (100,000 characters). Is there an endless loop?');
    }
    output += text;
  };
  pyodide.setStdout({ write: (bytes) => { write(new TextDecoder().decode(bytes)); return bytes.length; } });
  pyodide.setStderr({ write: (bytes) => { write(new TextDecoder().decode(bytes)); return bytes.length; } });
  const input = (data.stdin ?? '').split(/\r?\n/);
  pyodide.setStdin({ stdin: () => (input.length ? input.shift() : undefined) });

  const folder = `/home/pyodide/run${++runs}`;
  const fs = pyodide.FS;
  fs.mkdirTree(folder);
  for (const file of data.files ?? []) {
    const path = `${folder}/${file.path.replace(/^\/+/, '')}`;
    fs.mkdirTree(path.slice(0, path.lastIndexOf('/')));
    fs.writeFile(path, file.content ?? '', { encoding: 'utf8' });
  }
  const entry = data.entry || (data.files?.find(f => f.path.endsWith('.py'))?.path ?? 'main.py');
  const runner = pyodide.globals.get('_devpath_run');
  let error = null, tests = null;
  try {
    const result = runner(folder, entry, data.tests ?? null);
    const [err, res] = result.toJs({ dict_converter: Object.fromEntries });
    result.destroy();
    error = err ?? null;
    tests = res ?? null;
  } finally {
    runner.destroy();
  }
  return { output, truncated, error, tests, durationMs: Math.round(performance.now() - started) };
}

self.onmessage = async (event) => {
  const data = event.data;
  if (!data || data.type === 'asset' || !data.id) return;
  try { self.postMessage({ id: data.id, type: 'result', result: await run(data) }); }
  catch (e) { self.postMessage({ id: data.id, type: 'error', message: String((e && e.message) || e) }); }
};

boot().catch((e) => self.postMessage({ type: 'fatal', message: String((e && e.message) || e) }));

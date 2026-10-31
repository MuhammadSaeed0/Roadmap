// Web Worker for the C# runner. It is started by runners/host.js inside the sandboxed iframe, loads the
// .NET WebAssembly runtime, registers the reference assemblies and then compiles and runs requests.
// Protocol: in  { id, action: 'run', files: [{ path, content }], tests?, stdin? }
//           out { type: 'ready' } | { type: 'fatal', message } | { id, type: 'result', result } | { id, type: 'error', message }
import { dotnet } from './_framework/dotnet.js';

const base = import.meta.url;
// Engine files come from the app's cache through the runner host (see runners/host.js); JavaScript modules must be
// loaded by URL, so they keep using the network.
const fetchAsset = self.runnerFetch ?? fetch;

try {
  const runtime = await dotnet
    .withResourceLoader((type, name, defaultUri, integrity, behavior) =>
      behavior === 'dotnetjs' || String(behavior).startsWith('js-module') ? defaultUri : fetchAsset(defaultUri))
    .create();
  const exports = (await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName)).RunnerExports;
  const names = await (await fetchAsset(new URL('refs/manifest.json', base).href)).json();
  await Promise.all(names.map(async (name) => {
    const response = await fetchAsset(new URL(`refs/${name}.dll`, base).href);
    if (!response.ok) throw new Error(`Could not load the reference assembly ${name} (${response.status}).`);
    exports.AddReference(name, new Uint8Array(await response.arrayBuffer()));
  }));

  self.onmessage = async (event) => {
    if (event.data?.type === 'asset') return;   // answered by the asset bridge
    const { id, files, tests, stdin } = event.data;
    try {
      const json = await exports.Run(JSON.stringify({ files, tests: tests ?? null, stdin: stdin ?? null }));
      self.postMessage({ id, type: 'result', result: JSON.parse(json) });
    } catch (error) {
      self.postMessage({ id, type: 'error', message: String(error?.message ?? error) });
    }
  };
  // Roslyn's first compilation is slow while the runtime warms up. Doing it here, during loading, keeps the learner's
  // first run fast and out of reach of the run time limit.
  try {
    await exports.Run(JSON.stringify({ files: [{ path: 'Program.cs', content: 'System.Console.WriteLine(1);' }], tests: null, stdin: null }));
  } catch { /* only a warm-up */ }
  self.postMessage({ type: 'ready' });
} catch (error) {
  self.postMessage({ type: 'fatal', message: String(error?.message ?? error) });
}

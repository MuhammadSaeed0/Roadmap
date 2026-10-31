// Web Worker for the C# runner. It is started by runners/host.js inside the sandboxed iframe, loads the
// .NET WebAssembly runtime, registers the reference assemblies and then compiles and runs requests.
// Protocol: in  { id, action: 'run', files: [{ path, content }], tests?, stdin? }
//           out { type: 'ready' } | { type: 'fatal', message } | { id, type: 'result', result } | { id, type: 'error', message }
import { dotnet } from './_framework/dotnet.js';

const base = import.meta.url;

try {
  const runtime = await dotnet.create();
  const exports = (await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName)).RunnerExports;
  const names = await (await fetch(new URL('refs/manifest.json', base))).json();
  await Promise.all(names.map(async (name) => {
    const response = await fetch(new URL(`refs/${name}.dll`, base));
    if (!response.ok) throw new Error(`Could not load the reference assembly ${name} (${response.status}).`);
    exports.AddReference(name, new Uint8Array(await response.arrayBuffer()));
  }));

  self.onmessage = async (event) => {
    const { id, files, tests, stdin } = event.data;
    try {
      const json = await exports.Run(JSON.stringify({ files, tests: tests ?? null, stdin: stdin ?? null }));
      self.postMessage({ id, type: 'result', result: JSON.parse(json) });
    } catch (error) {
      self.postMessage({ id, type: 'error', message: String(error?.message ?? error) });
    }
  };
  self.postMessage({ type: 'ready' });
} catch (error) {
  self.postMessage({ type: 'fatal', message: String(error?.message ?? error) });
}

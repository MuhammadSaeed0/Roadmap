// Builds the parts of the in-browser code runners that come from other packages, into public/runners
// where the Angular build picks them up. Run before `ng build` / `ng serve`:  npm run build:runners
//
//   csharp   backend/DevPath.CodeRunner (Roslyn + .NET WebAssembly)      → public/runners/csharp
//   angular  Angular + RxJS bundled as browser modules for the preview    → public/runners/angular/vendor
//            and their type definitions for the editor's IntelliSense     → public/runners/angular/types
//
// Pass "csharp" or "angular" to build only one part.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const runners = resolve(root, 'public/runners');
const parts = process.argv.slice(2);
const wanted = part => parts.length === 0 || parts.includes(part);

if (wanted('csharp')) buildCSharp();
if (wanted('angular')) { await buildAngularVendor(); copyAngularTypes(); }

function buildCSharp() {
  const project = resolve(root, '../backend/DevPath.CodeRunner/DevPath.CodeRunner.csproj');
  const target = join(runners, 'csharp');
  const out = mkdtempSync(join(tmpdir(), 'devpath-csharp-runner-'));
  try {
    execFileSync('dotnet', ['publish', project, '-c', 'Release', '-o', out, '--nologo'], { stdio: 'inherit' });
    const published = join(out, 'wwwroot');
    if (!existsSync(join(published, '_framework', 'dotnet.js'))) throw new Error('The runner publish output has no _framework/dotnet.js.');
    rmSync(target, { recursive: true, force: true });
    cpSync(published, target, { recursive: true });
    console.log(`C# runner → ${relative(root, target)}`);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

/** Angular and RxJS as ES modules for the Angular preview (JIT compilation in the browser). */
async function buildAngularVendor() {
  const { build } = await import('esbuild');
  const entries = {
    core: '@angular/core', compiler: '@angular/compiler', common: '@angular/common', 'common-http': '@angular/common/http',
    'platform-browser': '@angular/platform-browser', forms: '@angular/forms', router: '@angular/router',
    rxjs: 'rxjs', 'rxjs-operators': 'rxjs/operators',
  };
  const target = join(runners, 'angular', 'vendor');
  rmSync(target, { recursive: true, force: true });
  await build({
    entryPoints: entries, bundle: true, splitting: true, format: 'esm', outdir: target,
    minify: true, target: 'es2022', legalComments: 'none', logLevel: 'warning', absWorkingDir: root,
  });
  const manifest = Object.fromEntries(Object.entries(entries).map(([file, specifier]) => [specifier, `${file}.js`]));
  writeFileSync(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Angular vendor bundle → ${relative(root, target)}`);
}

/**
 * The .d.ts files the editor needs to type-check Angular code, laid out as node_modules/… with small
 * index.d.ts files that point at Angular's flattened typings (so no package.json lookups are needed).
 */
function copyAngularTypes() {
  const require = createRequire(join(root, 'package.json'));
  const target = join(runners, 'angular', 'types');
  rmSync(target, { recursive: true, force: true });
  const files = [];
  const write = (path, content) => {
    const full = join(target, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
    files.push(path);
  };
  const copyTree = (from, to, skip = () => false) => {
    for (const name of readdirSync(from)) {
      const full = join(from, name);
      if (statSync(full).isDirectory()) copyTree(full, `${to}/${name}`, skip);
      else if (name.endsWith('.d.ts') && !skip(name)) { cpSync(full, join(target, to, name)); files.push(`${to}/${name}`); }
    }
  };
  const skipExtras = name => /^(testing|upgrade|animations|animations-async|http-testing|signals|signals-compat)\.d\.ts$/.test(name);
  for (const pkg of ['core', 'common', 'forms', 'router', 'platform-browser']) {
    const dir = dirname(require.resolve(`@angular/${pkg}/package.json`));
    copyTree(join(dir, 'types'), `@angular/${pkg}/types`, skipExtras);
    write(`@angular/${pkg}/index.d.ts`, `export * from './types/${pkg}';\n`);
  }
  write('@angular/common/http/index.d.ts', "export * from '../types/http';\n");
  write('@angular/core/primitives/signals/index.d.ts', "export * from '../../types/primitives-signals';\n");
  write('@angular/core/primitives/di/index.d.ts', "export * from '../../types/primitives-di';\n");
  const rxjs = dirname(require.resolve('rxjs/package.json'));
  copyTree(join(rxjs, 'dist', 'types'), 'rxjs/dist/types');
  write('rxjs/index.d.ts', "export * from './dist/types/index';\n");
  write('rxjs/operators/index.d.ts', "export * from '../dist/types/operators/index';\n");
  writeFileSync(join(target, 'manifest.json'), JSON.stringify(files.sort()));
  console.log(`Angular types (${files.length} files) → ${relative(root, target)}`);
}

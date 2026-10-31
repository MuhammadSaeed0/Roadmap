// Writes a Brotli copy (file.br) next to every compressible file of the production build, which the API serves
// to browsers that accept it (backend/DevPath.Api/Middleware/PrecompressedStaticFiles.cs). The editor and the
// in-browser runtimes are large, so compressing once at build time saves bandwidth without costing the host CPU.
// Gzip copies (from the .NET WebAssembly publish) are removed: every browser the site supports accepts Brotli.
//
// Run after `ng build`:  npm run precompress   [dist directory, default dist/frontend/browser]
import { brotliCompressSync, constants } from 'node:zlib';
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, process.argv[2] ?? 'dist/frontend/browser');
if (!existsSync(join(dist, 'index.html'))) throw new Error(`No build found in ${dist}. Run ng build first.`);

const COMPRESSIBLE = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg', '.wasm', '.dll', '.dat', '.ttf', '.map', '.txt', '.d.ts']);
let written = 0, removed = 0, before = 0, after = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) { walk(path); continue; }
    if (name.endsWith('.gz')) { rmSync(path); removed++; continue; }
    // index.html is the SPA fallback page and stays as it is.
    if (name.endsWith('.br') || path === join(dist, 'index.html') || stat.size < 1024 || !COMPRESSIBLE.has(extname(name))) continue;
    if (existsSync(path + '.br') && statSync(path + '.br').mtimeMs >= stat.mtimeMs) continue;
    const data = readFileSync(path);
    // Quality 11 is slow on multi-megabyte files; 9 is nearly as small and much faster.
    const compressed = brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: data.length > 2_000_000 ? 9 : 11, [constants.BROTLI_PARAM_SIZE_HINT]: data.length } });
    if (compressed.length >= data.length * 0.95) continue;
    writeFileSync(path + '.br', compressed);
    written++; before += data.length; after += compressed.length;
  }
}

walk(dist);
const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log(`Brotli: ${written} files in ${relative(root, dist)} (${mb(before)} → ${mb(after)}); removed ${removed} gzip copies.`);

/**
 * The code runners' engine files (the .NET runtime and assemblies for C#, SQLite for SQL), kept in this site's
 * Cache Storage so they are downloaded once, not on every visit. The runner host lives in a sandboxed iframe with
 * an opaque origin, which has no storage and doesn't reuse the HTTP cache, so it asks the app for each file.
 *
 * Only files under /runners/ are served: the sandbox must not be able to read anything else (the API, for example)
 * with this site's origin.
 */
const CACHE_NAME = 'devpath-runners-v1';
/**
 * The .NET runtime's files carry a 10-character content hash ("System.Linq.4ax3k1b9z2.wasm", "System.Console.byghioepvx.wasm"):
 * they never change, so a cached copy is always right.
 */
const FINGERPRINTED = /\/_framework\/(?:[^/]+\/)?[^/]+\.[a-z0-9]{10}\.(?:wasm|js|dat)$/;
const HASH = /\.[a-z0-9]{10}(\.(?:wasm|js|dat))$/;

export interface RunnerAsset { body: ArrayBuffer; contentType: string; }

export function runnerAssetUrl(url: string, baseUri: string): URL | null {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  const root = new URL('runners/', baseUri);
  if (parsed.origin !== root.origin || !parsed.pathname.startsWith(root.pathname) || parsed.search || parsed.hash) return null;
  if (decodeURIComponent(parsed.pathname).includes('..')) return null;
  return parsed;
}

export async function loadRunnerAsset(url: URL): Promise<RunnerAsset> {
  const cache = await openCache();
  const cached = cache ? await cache.match(url.href) : undefined;
  if (cached && FINGERPRINTED.test(url.pathname)) return read(cached);

  // Other files (the reference assemblies, sql-wasm.wasm) can change with a new version of the site: ask the
  // server whether the cached copy is still current. Offline, the cached copy is used.
  const headers: Record<string, string> = {};
  const etag = cached?.headers.get('etag'), modified = cached?.headers.get('last-modified');
  if (etag) headers['If-None-Match'] = etag;
  if (modified) headers['If-Modified-Since'] = modified;
  let response: Response;
  try {
    response = await fetch(url.href, { credentials: 'omit', cache: 'no-store', headers });
  } catch (e) {
    if (cached) return read(cached);
    throw e;
  }
  if (response.status === 304 && cached) return read(cached);
  if (!response.ok) {
    if (cached) return read(cached);
    throw new Error(`${url.pathname}: HTTP ${response.status}`);
  }
  const body = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  if (cache) {
    const keep: Record<string, string> = { 'content-type': contentType };
    const newEtag = response.headers.get('etag'), newModified = response.headers.get('last-modified');
    if (newEtag) keep['etag'] = newEtag;
    if (newModified) keep['last-modified'] = newModified;
    // Stored in the background: the engine gets the file now instead of waiting for the (one at a time) cache writes.
    const copy = body.slice(0);
    inBackground(async () => {
      await cache.put(url.href, new Response(copy, { headers: keep }));
      if (FINGERPRINTED.test(url.pathname)) await dropOlderVersions(cache, url);
    });
  }
  return { body, contentType };
}

let queue: Promise<void> = Promise.resolve();
function inBackground(task: () => Promise<void>): void {
  queue = queue.then(task).catch(() => undefined);   // storage full or blocked: the file is simply downloaded next time
}

/** Fingerprinted files in the cache, by name without the hash; read from the cache once per page. */
let versions: Promise<Map<string, string[]>> | null = null;
const stem = (u: URL) => u.href.replace(HASH, '$1');

/** A new version of a fingerprinted file replaces the old one ("System.Linq.<old hash>.wasm" is deleted). */
async function dropOlderVersions(cache: Cache, url: URL): Promise<void> {
  versions ??= cache.keys().then(keys => {
    const map = new Map<string, string[]>();
    for (const request of keys) {
      const other = new URL(request.url);
      if (FINGERPRINTED.test(other.pathname)) map.set(stem(other), [...(map.get(stem(other)) ?? []), other.href]);
    }
    return map;
  });
  const map = await versions;
  for (const href of map.get(stem(url)) ?? []) if (href !== url.href) await cache.delete(href);
  map.set(stem(url), [url.href]);
}

async function openCache(): Promise<Cache | null> {
  try { return typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME); } catch { return null; }
}

async function read(response: Response): Promise<RunnerAsset> {
  return { body: await response.arrayBuffer(), contentType: response.headers.get('content-type') ?? 'application/octet-stream' };
}

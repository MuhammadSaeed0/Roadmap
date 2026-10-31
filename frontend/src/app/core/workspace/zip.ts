import { WorkspaceFile } from '../models';

/**
 * Minimal ZIP support for "Download project" and "Import project", without a library: files are written
 * uncompressed ("stored"), and reading accepts stored and deflated entries (the browser's
 * DecompressionStream inflates them), which covers zips made by Windows, macOS and most tools.
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let crcTable: Uint32Array | null = null;
export function crc32(data: Uint8Array): number {
  crcTable ??= Uint32Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZip(files: WorkspaceFile[], root = ''): Blob {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode((root ? root + '/' : '') + file.path);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x0800, true);          // names are UTF-8
    v.setUint16(8, 0, true);               // stored
    v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, name.length, true);
    local.set(name, 30);
    chunks.push(local, data);

    const entry = new Uint8Array(46 + name.length);
    const c = new DataView(entry.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    entry.set(name, 46);
    central.push(entry);
    offset += local.length + data.length;
  }
  const size = central.reduce((n, e) => n + e.length, 0);
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, size, true);
  e.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end] as BlobPart[], { type: 'application/zip' });
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads the text files of a zip. Folders, binary files and anything over the size limit are skipped. */
export async function readZip(buffer: ArrayBuffer, maxBytes = 400_000): Promise<WorkspaceFile[]> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('not_a_zip');
  const count = view.getUint16(end + 10, true);
  let pointer = view.getUint32(end + 16, true);
  const files: WorkspaceFile[] = [];
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (view.getUint32(pointer, true) !== 0x02014b50) throw new Error('not_a_zip');
    const method = view.getUint16(pointer + 10, true);
    const compressed = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));
    pointer += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith('/') || name.startsWith('__MACOSX/')) continue;
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const raw = bytes.subarray(dataStart, dataStart + compressed);
    const data = method === 0 ? raw : method === 8 ? await inflate(raw) : null;
    if (!data || data.includes(0)) continue;          // unsupported or binary
    total += data.length;
    if (total > maxBytes) throw new Error('too_large');
    files.push({ path: name, content: decoder.decode(data) });
  }
  return stripCommonRoot(files);
}

/** "my-project/src/app.ts" → "src/app.ts" when every file shares the same top folder. */
function stripCommonRoot(files: WorkspaceFile[]): WorkspaceFile[] {
  const first = files[0]?.path.split('/')[0];
  if (!first || !files.every(f => f.path.startsWith(first + '/'))) return files;
  return files.map(f => ({ ...f, path: f.path.slice(first.length + 1) }));
}

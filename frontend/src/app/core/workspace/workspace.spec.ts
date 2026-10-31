import { WorkspaceFile } from '../models';
import { buildTree, createFile, createFolder, deletePath, pathError, renamePath } from './workspace-files';
import { createZip, crc32, readZip } from './zip';

const files: WorkspaceFile[] = [
  { path: 'src/app/app.ts', content: 'export class App {}' },
  { path: 'src/main.ts', content: 'bootstrap' },
  { path: 'README.md', content: '# Hi' },
];

describe('workspace files', () => {
  it('rejects paths that leave the workspace or use odd characters', () => {
    expect(pathError('src/app.ts')).toBeNull();
    expect(pathError('../secret.txt')).toBe('invalidPath');
    expect(pathError('src/./x.ts')).toBe('invalidPath');
    expect(pathError('a b.ts')).toBe('invalidPath');
    expect(pathError('')).toBe('invalidPath');
  });

  it('builds a tree with folders first', () => {
    const tree = buildTree(files);
    expect(tree.map(n => n.name)).toEqual(['src', 'README.md']);
    expect(tree[0].children.map(n => n.name)).toEqual(['app', 'main.ts']);
  });

  it('creates files and folders, refusing duplicates', () => {
    expect(createFile(files, 'src/app/app.ts').error).toBe('exists');
    const withFolder = createFolder(files, 'src/models').files!;
    expect(buildTree(withFolder)[0].children.map(n => n.name)).toContain('models');
    const withFile = createFile(withFolder, 'src/models/user.ts', 'export interface User {}').files!;
    expect(withFile.some(f => f.path === 'src/models/.keep')).toBe(false);
  });

  it('renames folders with everything inside them', () => {
    const renamed = renamePath(files, 'src/app', 'src/core').files!;
    expect(renamed.map(f => f.path)).toContain('src/core/app.ts');
    expect(renamePath(files, 'README.md', 'src/main.ts').error).toBe('exists');
    expect(renamePath(files, 'src', 'src/inner').error).toBe('invalidPath');
  });

  it('keeps an emptied folder visible after deleting its last file', () => {
    const left = deletePath(files, 'src/app/app.ts');
    expect(left.some(f => f.path === 'src/app/.keep')).toBe(true);
    expect(deletePath(files, 'src').map(f => f.path)).toEqual(['README.md']);
  });
});

describe('zip', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('round-trips files, including Arabic text, and strips the download folder', async () => {
    const zip = createZip([...files, { path: 'notes.txt', content: 'مرحبا' }], 'my-project');
    const back = await readZip(await zip.arrayBuffer());
    expect(back).toEqual([...files, { path: 'notes.txt', content: 'مرحبا' }]);
  });

  it('rejects something that is not a zip', async () => {
    await expect(readZip(new TextEncoder().encode('hello').buffer as ArrayBuffer)).rejects.toThrow('not_a_zip');
  });
});

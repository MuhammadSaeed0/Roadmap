import { WorkspaceFile } from '../models';

/** Same limits as the API (WorkspaceFiles.cs), so the editor can say what's wrong before saving. */
export const MAX_FILES = 80;
export const MAX_TOTAL_CHARS = 400_000;
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/;

/** A folder exists when a file lives in it; empty folders are kept with a hidden placeholder file. */
export const FOLDER_KEEP = '.keep';

export interface TreeNode {
  name: string;
  path: string;
  folder: boolean;
  children: TreeNode[];
}

/** Returns an error key (under ide.errors) or null when the path is valid. */
export function pathError(path: string): string | null {
  const clean = path.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!clean || clean.length > 200) return 'invalidPath';
  return clean.split('/').every(s => s !== '.' && s !== '..' && SEGMENT.test(s)) ? null : 'invalidPath';
}

export function normalizePath(path: string): string {
  return path.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

export function joinPath(folder: string, name: string): string {
  return folder ? `${folder}/${name}` : name;
}

export function parentOf(path: string): string {
  const i = path.lastIndexOf('/');
  return i < 0 ? '' : path.slice(0, i);
}

export function nameOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

/** Builds the explorer tree: folders first, then files, each alphabetically. */
export function buildTree(files: WorkspaceFile[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', folder: true, children: [] };
  for (const file of files) {
    const parts = file.path.split('/');
    let node = root;
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join('/');
      const isFile = i === parts.length - 1;
      if (isFile && part === FOLDER_KEEP) return;
      let child = node.children.find(c => c.name === part && c.folder === !isFile);
      if (!child) {
        child = { name: part, path, folder: !isFile, children: [] };
        node.children.push(child);
      }
      node = child;
    });
  }
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.folder === b.folder ? a.name.localeCompare(b.name) : a.folder ? -1 : 1));
    nodes.forEach(n => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

export function folderPaths(files: WorkspaceFile[]): string[] {
  const set = new Set<string>();
  for (const f of files) {
    let p = parentOf(f.path);
    while (p) { set.add(p); p = parentOf(p); }
  }
  return [...set].sort();
}

export type FileOpResult = { files: WorkspaceFile[]; error?: undefined } | { files?: undefined; error: string };

export function createFile(files: WorkspaceFile[], path: string, content = ''): FileOpResult {
  const clean = normalizePath(path);
  const error = pathError(clean);
  if (error) return { error };
  if (files.some(f => f.path.toLowerCase() === clean.toLowerCase())) return { error: 'exists' };
  if (files.filter(f => nameOf(f.path) !== FOLDER_KEEP).length >= MAX_FILES) return { error: 'tooManyFiles' };
  // A real file makes the folder's placeholder unnecessary.
  const parent = parentOf(clean);
  return { files: [...files.filter(f => f.path !== joinPath(parent, FOLDER_KEEP)), { path: clean, content }] };
}

export function createFolder(files: WorkspaceFile[], path: string): FileOpResult {
  const clean = normalizePath(path);
  const error = pathError(clean);
  if (error) return { error };
  if (folderPaths(files).some(p => p.toLowerCase() === clean.toLowerCase()) || files.some(f => f.path.toLowerCase() === clean.toLowerCase()))
    return { error: 'exists' };
  return { files: [...files, { path: joinPath(clean, FOLDER_KEEP), content: '' }] };
}

/** Renames a file or a folder (and everything inside it). */
export function renamePath(files: WorkspaceFile[], from: string, to: string): FileOpResult {
  const target = normalizePath(to);
  const error = pathError(target);
  if (error) return { error };
  if (target === from) return { files };
  const isFolder = !files.some(f => f.path === from);
  const moved = (p: string) => (isFolder ? p === from || p.startsWith(from + '/') : p === from);
  const renamed = files.map(f => (moved(f.path) ? { ...f, path: target + f.path.slice(from.length) } : f));
  const paths = renamed.map(f => f.path.toLowerCase());
  if (new Set(paths).size !== paths.length) return { error: 'exists' };
  if (target.startsWith(from + '/')) return { error: 'invalidPath' };
  return { files: renamed };
}

export function deletePath(files: WorkspaceFile[], path: string): WorkspaceFile[] {
  const remaining = files.filter(f => f.path !== path && !f.path.startsWith(path + '/'));
  // Keep the parent folder visible when its last file goes.
  const parent = parentOf(path);
  if (parent && !remaining.some(f => f.path.startsWith(parent + '/'))) remaining.push({ path: joinPath(parent, FOLDER_KEEP), content: '' });
  return remaining;
}

export function totalChars(files: WorkspaceFile[]): number {
  return files.reduce((n, f) => n + f.path.length + f.content.length, 0);
}

/** Files that hold code (placeholders for empty folders are left out). */
export function realFiles(files: WorkspaceFile[]): WorkspaceFile[] {
  return files.filter(f => nameOf(f.path) !== FOLDER_KEEP);
}

import { WorkspaceFile } from '../models';
import { MonacoApi, typescriptApi } from './monaco';

export interface CompiledModule { path: string; code: string; }

/**
 * Compiles TypeScript files to JavaScript with the TypeScript service that already runs inside Monaco,
 * so the browser doesn't download a second copy of the compiler. Each file is emitted on its own
 * (like `isolatedModules`); type errors are shown by the editor and don't stop the run.
 */
export async function compileTypeScript(monaco: MonacoApi, files: WorkspaceFile[], angular = false): Promise<CompiledModule[]> {
  const ts = typescriptApi(monaco);
  const root = `file:///__build_${Math.random().toString(36).slice(2)}/`;
  const sources = files.filter(f => /\.(ts|js)$/.test(f.path) && !f.path.endsWith('.d.ts'));
  const models = sources.map(f => monaco.editor.createModel(
    angular ? inlineComponentResources(f, files) : f.content,
    f.path.endsWith('.js') ? 'javascript' : 'typescript',
    monaco.Uri.parse(root + f.path)));
  try {
    const getWorker = await (models.some(m => m.getLanguageId() === 'typescript') ? ts.getTypeScriptWorker() : ts.getJavaScriptWorker());
    const result: CompiledModule[] = [];
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      if (model.getLanguageId() === 'javascript') { result.push({ path: sources[i].path, code: model.getValue() }); continue; }
      const client = await getWorker(model.uri);
      const output = await client.getEmitOutput(model.uri.toString());
      const js = output.outputFiles.find((o: { name: string }) => o.name.endsWith('.js'));
      result.push({ path: sources[i].path, code: js?.text ?? '' });
    }
    return result;
  } finally {
    models.forEach(m => m.dispose());
  }
}

/**
 * Angular compiles templateUrl and styleUrl(s) at build time; the in-browser preview compiles just in time,
 * so the HTML and CSS files are inlined as `template` and `styles` before compiling.
 */
export function inlineComponentResources(file: WorkspaceFile, files: WorkspaceFile[]): string {
  const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : '';
  const read = (ref: string) => {
    const parts = dir ? dir.split('/') : [];
    for (const part of ref.split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    const path = parts.join('/');
    const found = files.find(f => f.path === path);
    if (!found) throw new Error(`${file.path}: cannot find "${ref}".`);
    return found.content;
  };
  return file.content
    .replace(/templateUrl\s*:\s*(['"`])([^'"`]+)\1/g, (_, __, ref) => `template: ${JSON.stringify(read(ref))}`)
    .replace(/styleUrl\s*:\s*(['"`])([^'"`]+)\1/g, (_, __, ref) => `styles: [${JSON.stringify(read(ref))}]`)
    .replace(/styleUrls\s*:\s*\[([^\]]*)\]/g, (_, list: string) =>
      `styles: [${[...list.matchAll(/(['"`])([^'"`]+)\1/g)].map(m => JSON.stringify(read(m[2]))).join(', ')}]`);
}

/**
 * The JavaScript runner executes one classic script, so a multi-file JavaScript/TypeScript workspace is
 * joined into one: imports between the workspace's own files are dropped and `export` keywords removed
 * (everything then shares one scope). The entry file runs last.
 */
export function joinScripts(modules: CompiledModule[], entry: string): string {
  const ordered = [...modules.filter(m => m.path !== entry), ...modules.filter(m => m.path === entry)];
  return ordered.map(m => `// ---- ${m.path}\n` + m.code
    .replace(/^\s*import\s+[^;'"]*?\s+from\s+['"]\.{1,2}\/[^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*import\s+['"]\.{1,2}\/[^'"]+['"];?\s*$/gm, '')
    .replace(/^(\s*)export\s+default\s+(?=(async\s+)?(function|class)\b)/gm, '$1')
    .replace(/^(\s*)export\s+(?=(async\s+)?(const|let|var|function|class|interface|type|enum)\b)/gm, '$1')
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '')
    .replace(/^\s*export\s*\{\s*\};?\s*$/gm, ''))
    .join('\n');
}

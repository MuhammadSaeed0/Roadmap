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
    angular ? addSignalMetadata(inlineComponentResources(f, files)) : f.content,
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

const SIGNAL_MEMBER = /^([ \t]*)((?:(?:public|protected|private|readonly|override)\s+)*)([A-Za-z_$][\w$]*)\s*(?::[^=;\n]+)?=\s*(input|model|output|outputFromObservable|viewChild|viewChildren|contentChild|contentChildren)(\.required)?\s*(?:<[^()\n]*>)?\s*\(/gm;

/** The text between the parenthesis at `open` and its matching closing one, or null when unbalanced. */
function callArguments(source: string, open: number): string | null {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') { if (--depth === 0) return source.slice(open + 1, i); }
    else if (ch === '"' || ch === "'" || ch === '`') { const end = source.indexOf(ch, i + 1); if (end < 0) return null; i = end; }
  }
  return null;
}

/** Splits call arguments at top-level commas. */
function splitArguments(args: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < args.length; i++) {
    const ch = args[i];
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === '"' || ch === "'" || ch === '`') i = Math.max(i, args.indexOf(ch, i + 1));
    else if (ch === ',' && depth === 0) { parts.push(args.slice(start, i).trim()); start = i + 1; }
  }
  if (args.slice(start).trim()) parts.push(args.slice(start).trim());
  return parts;
}

const option = (options: string | undefined, name: string) => options?.match(new RegExp(`\\b${name}\\s*:\\s*([^,}]+)`))?.[1].trim();

/**
 * Signal-based inputs, outputs and queries (input(), model(), output(), viewChild() …) are registered by the
 * Angular CLI's compiler at build time; the just-in-time compiler used by the preview only reads decorator
 * metadata. This adds the metadata the CLI would add, e.g. `@Input({ isSignal: true, … })` for `input()`,
 * so `[value]="…"` and `(changed)="…"` bindings work in the preview as they do in a real build.
 */
export function addSignalMetadata(source: string): string {
  if (!/@angular\/core/.test(source)) return source;
  const used = new Set<string>();
  const result = source.replace(SIGNAL_MEMBER, (match, indent: string, modifiers: string, field: string, fn: string, required: string | undefined, offset: number) => {
    const args = callArguments(source, offset + match.length - 1);
    if (args === null) return match;
    const list = splitArguments(args);
    const decorators: string[] = [];
    const isRequired = !!required;
    if (fn === 'input' || fn === 'model') {
      // input(initial, options) / input.required(options); model likewise.
      const options = isRequired ? list[0] : list[1];
      const alias = option(options, 'alias')?.replace(/^['"`]|['"`]$/g, '') ?? field;
      const transform = fn === 'input' ? option(options, 'transform') : undefined;
      decorators.push(`@__dpInput({ isSignal: true, alias: ${JSON.stringify(alias)}, required: ${isRequired}, transform: ${transform ?? 'undefined'} })`);
      used.add('Input as __dpInput');
      if (fn === 'model') { decorators.push(`@__dpOutput(${JSON.stringify(alias + 'Change')})`); used.add('Output as __dpOutput'); }
    } else if (fn === 'output' || fn === 'outputFromObservable') {
      const options = fn === 'output' ? list[0] : list[1];
      const alias = option(options, 'alias')?.replace(/^['"`]|['"`]$/g, '') ?? field;
      decorators.push(`@__dpOutput(${JSON.stringify(alias)})`);
      used.add('Output as __dpOutput');
    } else {
      const kind = { viewChild: 'ViewChild', viewChildren: 'ViewChildren', contentChild: 'ContentChild', contentChildren: 'ContentChildren' }[fn]!;
      const read = option(list[1], 'read');
      const descendants = option(list[1], 'descendants');
      const opts = [`isSignal: true`, read ? `read: ${read}` : '', descendants ? `descendants: ${descendants}` : ''].filter(Boolean).join(', ');
      decorators.push(`@__dp${kind}(${list[0]}, { ${opts} })`);
      used.add(`${kind} as __dp${kind}`);
    }
    return `${indent}${decorators.join(' ')} ${modifiers}${match.slice(indent.length + modifiers.length)}`;
  });
  return used.size ? `import { ${[...used].join(', ')} } from '@angular/core';\n${result}` : source;
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

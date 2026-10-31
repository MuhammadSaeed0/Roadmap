import type * as Monaco from 'monaco-editor';

export type MonacoApi = typeof Monaco;
export type MonacoEditor = Monaco.editor.IStandaloneCodeEditor;
export type MonacoModel = Monaco.editor.ITextModel;

/**
 * Loads the Monaco editor (the editor of VS Code) on first use. It is self-hosted under /monaco/vs
 * (copied from node_modules by angular.json) and stays out of the app's initial bundle: only pages
 * with an editor download it.
 */
let loading: Promise<MonacoApi> | null = null;

export function loadMonaco(): Promise<MonacoApi> {
  loading ??= new Promise<MonacoApi>((resolve, reject) => {
    const w = window as unknown as { monaco?: MonacoApi; require?: AmdRequire };
    if (w.monaco) { resolve(w.monaco); return; }
    const base = new URL('monaco/vs', document.baseURI).href;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = base + '/editor/editor.main.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = base + '/loader.js';
    script.onload = () => {
      w.require!.config({ paths: { vs: base } });
      w.require!(['vs/editor/editor.main'], () => { configure(w.monaco!); resolve(w.monaco!); }, (e: unknown) => reject(e));
    };
    script.onerror = () => { loading = null; reject(new Error('editor_unavailable')); };
    document.head.appendChild(script);
  });
  return loading;
}

interface AmdRequire {
  (deps: string[], onLoad: () => void, onError: (e: unknown) => void): void;
  config(options: { paths: Record<string, string> }): void;
}

/** Monaco 0.55+ exposes the TypeScript service as monaco.typescript; older builds as monaco.languages.typescript. */
export function typescriptApi(monaco: MonacoApi): typeof Monaco.typescript {
  const m = monaco as unknown as { typescript?: typeof Monaco.typescript; languages: { typescript?: typeof Monaco.typescript } };
  return (m.typescript ?? m.languages.typescript)!;
}

/** The editor language for a file name. */
export function languageOf(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return ({
    cs: 'csharp', ts: 'typescript', js: 'javascript', mjs: 'javascript', html: 'html', htm: 'html', css: 'css', scss: 'scss',
    json: 'json', sql: 'sql', md: 'markdown', xml: 'xml', csproj: 'xml', yml: 'yaml', yaml: 'yaml', sh: 'shell', http: 'plaintext',
  } as Record<string, string>)[ext] ?? 'plaintext';
}

let sqlTables: { name: string; columns: string[] }[] = [];

/** Table and column names offered by SQL autocomplete (updated whenever the SQL runner reports its schema). */
export function setSqlCompletionSchema(tables: { name: string; columns: { name: string }[] }[]): void {
  sqlTables = tables.map(t => ({ name: t.name, columns: t.columns.map(c => c.name) }));
}

function configure(monaco: MonacoApi): void {
  const ts = typescriptApi(monaco);
  const options = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    lib: ['es2022', 'dom', 'dom.iterable'],
    strict: true,
    experimentalDecorators: true,
    useDefineForClassFields: false,
    allowNonTsExtensions: true,
    skipLibCheck: true,
    noEmitOnError: false,
  };
  ts.typescriptDefaults.setCompilerOptions(options);
  ts.javascriptDefaults.setCompilerOptions({ ...options, allowJs: true, checkJs: false });
  ts.typescriptDefaults.setEagerModelSync(true);

  const snippet = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
  const kind = monaco.languages.CompletionItemKind;

  // C#: Monaco highlights it; these keywords, common types and snippets give useful autocomplete without a language server.
  const csKeywords = ('abstract as async await base bool break byte case catch char class const continue decimal default delegate do double else enum ' +
    'event explicit false finally float for foreach get if implicit in init int interface internal is long namespace new null object operator out ' +
    'override params private protected public readonly record ref required return sealed set short static string struct switch this throw true try ' +
    'typeof uint ulong using var virtual void while with yield').split(' ');
  const csTypes = ('Console List Dictionary HashSet Queue Stack IEnumerable IReadOnlyList Task Exception ArgumentException InvalidOperationException ' +
    'ArgumentNullException KeyNotFoundException DateTime TimeSpan Math StringBuilder Enumerable Func Action Guid').split(' ');
  monaco.languages.registerCompletionItemProvider('csharp', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const snippets: [string, string, string][] = [
        ['cw', 'Console.WriteLine($0);', 'Console.WriteLine'],
        ['prop', 'public ${1:string} ${2:Name} { get; set; }', 'Property'],
        ['class', 'public class ${1:Name}\n{\n\t$0\n}', 'Class'],
        ['record', 'public record ${1:Name}(${2:string Value});', 'Record'],
        ['interface', 'public interface I${1:Name}\n{\n\t$0\n}', 'Interface'],
        ['ctor', 'public ${1:ClassName}()\n{\n\t$0\n}', 'Constructor'],
        ['for', 'for (var ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++)\n{\n\t$0\n}', 'for loop'],
        ['foreach', 'foreach (var ${1:item} in ${2:items})\n{\n\t$0\n}', 'foreach loop'],
        ['if', 'if (${1:condition})\n{\n\t$0\n}', 'if statement'],
        ['try', 'try\n{\n\t$0\n}\ncatch (${1:Exception} ex)\n{\n\tConsole.WriteLine(ex.Message);\n}', 'try/catch'],
        ['main', 'public static void Main()\n{\n\t$0\n}', 'Main method'],
        ['test', '[Test("${1:does something}")]\npublic static void ${2:Name}()\n{\n\tAssert.Equal(${3:expected}, ${4:actual});\n}', 'Test method'],
      ];
      // Identifiers already in the file, so your own classes and methods are suggested too.
      const known = new Set((model.getValue().match(/\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g) ?? []));
      return {
        suggestions: [
          ...snippets.map(([label, insertText, detail]) => ({ label, kind: kind.Snippet, insertText, insertTextRules: snippet, detail, range })),
          ...csKeywords.map(k => ({ label: k, kind: kind.Keyword, insertText: k, range })),
          ...csTypes.map(t => ({ label: t, kind: kind.Class, insertText: t, range })),
          ...[...known].filter(w => !csKeywords.includes(w) && !csTypes.includes(w)).map(w => ({ label: w, kind: kind.Text, insertText: w, range })),
        ],
      };
    },
  });

  // SQL: keywords plus the tables and columns of the current practice database.
  const sqlKeywords = ('SELECT FROM WHERE AND OR NOT IN IS NULL LIKE BETWEEN ORDER BY GROUP HAVING DISTINCT TOP LIMIT OFFSET AS JOIN INNER LEFT ' +
    'RIGHT FULL OUTER CROSS ON INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX VIEW PRIMARY KEY FOREIGN REFERENCES UNIQUE ' +
    'CHECK DEFAULT CONSTRAINT UNION ALL EXISTS CASE WHEN THEN ELSE END WITH COUNT SUM AVG MIN MAX COALESCE CAST BEGIN TRANSACTION COMMIT ROLLBACK ' +
    'OVER PARTITION ROW_NUMBER RANK DENSE_RANK ASC DESC INT INTEGER DECIMAL NVARCHAR VARCHAR BIT DATE DATETIME2').split(' ');
  monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: ['.'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const before = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: 1, endLineNumber: position.lineNumber, endColumn: word.startColumn });
      const qualifier = /([A-Za-z_][A-Za-z0-9_]*)\.$/.exec(before)?.[1]?.toLowerCase();
      if (qualifier) {
        const table = sqlTables.find(t => t.name.toLowerCase() === qualifier);
        const columns = table ? table.columns : sqlTables.flatMap(t => t.columns);
        return { suggestions: [...new Set(columns)].map(c => ({ label: c, kind: kind.Field, insertText: c, range })) };
      }
      return {
        suggestions: [
          ...sqlKeywords.map(k => ({ label: k, kind: kind.Keyword, insertText: k, range })),
          ...sqlTables.map(t => ({ label: t.name, kind: kind.Struct, insertText: t.name, detail: t.columns.join(', '), range })),
          ...[...new Set(sqlTables.flatMap(t => t.columns))].map(c => ({ label: c, kind: kind.Field, insertText: c, range })),
        ],
      };
    },
  });
}

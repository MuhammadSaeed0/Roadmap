import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, OnDestroy, computed, effect, inject, input, output,
  signal, untracked, viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoApi, MonacoEditor, MonacoModel, languageOf, loadMonaco, setSqlCompletionSchema, typescriptApi } from '../../core/editor/monaco';
import { compileTypeScript, joinScripts } from '../../core/editor/ts-compile';
import { I18nService } from '../../core/i18n/i18n.service';
import '../../core/i18n/workspace-strings';
import { TranslatePipe } from '../../core/i18n/pipes';
import { WorkspaceFile, WorkspaceKind } from '../../core/models';
import { RunnerEngine, RunnerHostService, SqlRunResult, SqlTable, TestResult } from '../../core/runners/runner-host.service';
import { compareResult, parseSqlChecks } from '../../core/runners/sql-check';
import { datasetSetup } from '../../core/runners/sql-datasets';
import { TsqlConversion, rewriteTsql, sqlErrorHint } from '../../core/runners/tsql-compat';
import { ConfirmService, ThemeService, ToastService } from '../../core/ui-services';
import {
  FOLDER_KEEP, buildTree, createFile, createFolder, deletePath, folderPaths, joinPath, nameOf, parentOf, realFiles, renamePath,
} from '../../core/workspace/workspace-files';
import { createZip, readZip } from '../../core/workspace/zip';
import { IconComponent } from '../icon.component';
import { FileTreeComponent, TreeAction } from './file-tree.component';
import { SqlResultsComponent } from './sql-results.component';

export type IdeMode = 'playground' | 'exercise';
type Panel = 'output' | 'problems' | 'tests' | 'results' | 'input';
export interface ConsoleLine { level: 'log' | 'info' | 'warn' | 'error' | 'debug' | 'system'; text: string; }
export interface Problem { file: string; line: number; column: number; severity: 'error' | 'warning'; message: string; }
export interface TestSummary { passed: number; total: number; }

const ENGINE: Partial<Record<WorkspaceKind, RunnerEngine>> = { CSharp: 'csharp', Sql: 'sql', JavaScript: 'javascript', TypeScript: 'javascript' };
const PREVIEW: Partial<Record<WorkspaceKind, string>> = { Web: 'runners/preview/web.html', Angular: 'runners/preview/angular.html' };
let instances = 0;
let angularTypes: Promise<void> | null = null;

/**
 * A small browser IDE: file explorer, tabs, the Monaco editor, and a run panel. Code runs in the learner's
 * browser (see RunnerHostService and the preview pages), never on the server. Used by the Code Playground
 * and by Practice Lab exercises; the page that hosts it decides where files are saved.
 */
@Component({
  selector: 'app-ide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, TranslatePipe, FileTreeComponent, SqlResultsComponent],
  templateUrl: './ide.component.html',
  host: { class: 'ide', '[class.ide-fullscreen]': 'fullscreen()', '[class.ide-has-preview]': 'hasPreview()', '[attr.data-kind]': 'kind()' },
})
export class IdeComponent implements OnDestroy {
  private readonly runner = inject(RunnerHostService);
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly kind = input.required<WorkspaceKind>();
  /** The files to start with. Changing this input replaces the workspace (e.g. "reset" or "load solution"). */
  readonly files = input.required<WorkspaceFile[]>();
  readonly entry = input<string | null>(null);
  readonly mode = input<IdeMode>('playground');
  /** SQL: the sample database ('' = empty). */
  readonly dataset = input<string>('');
  /** Automatic checks: C# or JavaScript test code, or the SQL checks JSON. */
  readonly tests = input<string | null>(null);
  readonly name = input('project');
  readonly readonly = input(false);
  /** False for code that can't run in the browser (ASP.NET Core, EF Core with a database): edit, save and download only. */
  readonly runnable = input(true);
  /** Shown in the toolbar, e.g. "Saved" — the host page does the saving. */
  readonly saveLabel = input('');

  /** Debounced copy of the files after every edit. */
  readonly changed = output<WorkspaceFile[]>();
  readonly saveRequested = output<WorkspaceFile[]>();
  readonly testsFinished = output<TestSummary>();

  private readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');
  private readonly previewFrame = viewChild<ElementRef<HTMLIFrameElement>>('previewFrame');
  private readonly importInput = viewChild.required<ElementRef<HTMLInputElement>>('importInput');

  protected readonly id = ++instances;
  protected readonly workspace = signal<WorkspaceFile[]>([]);
  protected readonly active = signal<string | null>(null);
  protected readonly tabs = signal<string[]>([]);
  protected readonly expanded = signal(new Set<string>());
  protected readonly editorState = signal<'loading' | 'ready' | 'failed'>('loading');
  protected readonly panel = signal<Panel>('output');
  protected readonly consoleLines = signal<ConsoleLine[]>([]);
  protected readonly problems = signal<Problem[]>([]);
  protected readonly testResults = signal<TestResult[] | null>(null);
  protected readonly sqlResult = signal<SqlRunResult | null>(null);
  protected readonly sqlConversions = signal<TsqlConversion[]>([]);
  protected readonly sqlHint = signal<string | null>(null);
  protected readonly schema = signal<SqlTable[]>([]);
  protected readonly sidebar = signal<'files' | 'database'>('files');
  protected readonly running = signal(false);
  protected readonly stdin = signal('');
  protected readonly fullscreen = signal(false);
  protected readonly explorerOpen = signal(true);
  protected readonly lastRun = signal<{ ms: number; ok: boolean } | null>(null);
  /** Inline "new file / new folder / rename" input in the explorer. */
  protected readonly naming = signal<{ action: 'newFile' | 'newFolder' | 'rename'; parent: string; from?: string } | null>(null);
  protected readonly nameDraft = signal('');
  protected readonly nameError = signal<string | null>(null);

  protected readonly tree = computed(() => buildTree(this.workspace()));
  protected readonly engine = computed(() => ENGINE[this.kind()] ?? null);
  protected readonly engineStatus = computed(() => (this.engine() ? this.runner.status()[this.engine()!] : 'ready'));
  protected readonly hasPreview = computed(() => !!PREVIEW[this.kind()]);
  protected readonly hasTests = computed(() => !!this.tests() && this.runnable());
  protected readonly errorCount = computed(() => this.problems().filter(p => p.severity === 'error').length);
  protected readonly testSummary = computed(() => {
    const t = this.testResults();
    return t ? { passed: t.filter(r => r.passed).length, total: t.length } : null;
  });
  protected readonly canFormat = computed(() => ['typescript', 'javascript', 'html', 'css', 'scss', 'json'].includes(languageOf(this.active() ?? '')));
  protected readonly isRtl = this.i18n.isRtl;

  private monaco: MonacoApi | null = null;
  private editor: MonacoEditor | null = null;
  private readonly models = new Map<string, MonacoModel>();
  private readonly viewStates = new Map<string, unknown>();
  private changeTimer: ReturnType<typeof setTimeout> | undefined;
  private applyingInput = false;
  private previewReady: ((value: void) => void) | null = null;
  private readonly root = `file:///ws${this.id}/`;
  private disposed = false;

  constructor() {
    // A new files input (first load, reset, solution) replaces the workspace.
    effect(() => {
      const files = this.files();
      const entry = this.entry();
      untracked(() => this.load(files, entry));
    });
    effect(() => {
      const dark = this.theme.resolved() === 'dark';
      untracked(() => this.monaco?.editor.setTheme(dark ? 'vs-dark' : 'vs'));
    });
    effect(() => {
      const ro = this.readonly();
      untracked(() => this.editor?.updateOptions({ readOnly: ro }));
    });
    const onMessage = (event: MessageEvent) => this.onPreviewMessage(event);
    this.zone.runOutsideAngular(() => window.addEventListener('message', onMessage));
    const onFullscreen = () => { if (!document.fullscreenElement && this.fullscreen()) this.fullscreen.set(false); };
    document.addEventListener('fullscreenchange', onFullscreen);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('fullscreenchange', onFullscreen);
    });
    void this.initEditor();
    if (window.matchMedia?.('(max-width: 900px)').matches) this.explorerOpen.set(false);
  }

  ngOnDestroy(): void {
    this.disposed = true;
    clearTimeout(this.changeTimer);
    this.editor?.dispose();
    this.models.forEach(m => m.dispose());
    if (this.monaco) this.monaco.editor.getModels().filter(m => m.uri.toString().startsWith(this.root)).forEach(m => m.dispose());
  }

  /** The current files, for the host page (save, submit). */
  currentFiles(): WorkspaceFile[] { return this.workspace(); }

  // ---------- Editor ----------

  private async initEditor(): Promise<void> {
    try {
      this.monaco = await loadMonaco();
    } catch {
      this.editorState.set('failed');
      return;
    }
    if (this.disposed) return;
    const monaco = this.monaco;
    if (this.kind() === 'Angular') void this.loadAngularTypes(monaco);
    this.zone.runOutsideAngular(() => {
      this.editor = monaco.editor.create(this.editorHost().nativeElement, {
        automaticLayout: true, minimap: { enabled: false }, fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
        fontSize: 14, tabSize: 4, scrollBeyondLastLine: false, theme: this.theme.resolved() === 'dark' ? 'vs-dark' : 'vs',
        readOnly: this.readonly(), renderWhitespace: 'selection', bracketPairColorization: { enabled: true },
        fixedOverflowWidgets: true, ariaLabel: this.i18n.t('ide.editorLabel'),
      });
      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => this.zone.run(() => void this.run()));
      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => this.zone.run(() => void this.runTests()));
      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this.zone.run(() => this.saveRequested.emit(this.workspace())));
      monaco.editor.onDidChangeMarkers(uris => {
        if (uris.some(u => u.toString().startsWith(this.root))) this.zone.run(() => this.collectMarkers());
      });
    });
    this.syncModels();
    if (this.active()) this.showFile(this.active()!);
    this.editorState.set('ready');
    if (this.engine() === 'csharp' && this.runnable()) this.runner.warmup('csharp');
    if (this.kind() === 'Sql') void this.refreshSchema(true);
  }

  private load(files: WorkspaceFile[], entry: string | null): void {
    this.applyingInput = true;
    const copy = files.map(f => ({ ...f }));
    this.workspace.set(copy);
    const real = realFiles(copy);
    const first = (entry && real.some(f => f.path === entry) ? entry : null) ?? real[0]?.path ?? null;
    this.tabs.set(first ? [first] : []);
    this.active.set(first);
    this.expanded.set(new Set(folderPaths(copy)));
    this.testResults.set(null);
    this.problems.set([]);
    this.syncModels();
    if (first) this.showFile(first);
    this.applyingInput = false;
  }

  /** Keeps one Monaco model per file (models hold undo history and give TypeScript cross-file types). */
  private syncModels(): void {
    const monaco = this.monaco;
    if (!monaco) return;
    const wanted = new Set(this.workspace().map(f => f.path));
    for (const [path, model] of this.models) {
      if (!wanted.has(path)) { model.dispose(); this.models.delete(path); this.viewStates.delete(path); }
    }
    for (const file of realFiles(this.workspace())) {
      const existing = this.models.get(file.path);
      if (existing) {
        if (existing.getValue() !== file.content) existing.setValue(file.content);
        continue;
      }
      const uri = monaco.Uri.parse(this.root + file.path);
      monaco.editor.getModel(uri)?.dispose();
      const model = monaco.editor.createModel(file.content, languageOf(file.path), uri);
      model.onDidChangeContent(() => this.zone.run(() => this.onModelChanged(file.path, model)));
      this.models.set(file.path, model);
    }
  }

  private onModelChanged(path: string, model: MonacoModel): void {
    const content = model.getValue();
    const current = this.workspace().find(f => f.path === path);
    if (!current || current.content === content) return;
    this.workspace.update(files => files.map(f => (f.path === path ? { ...f, content } : f)));
    if (this.applyingInput) return;
    clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => this.changed.emit(this.workspace()), 800);
  }

  private emitChange(): void {
    clearTimeout(this.changeTimer);
    this.changed.emit(this.workspace());
  }

  protected showFile(path: string): void {
    const model = this.models.get(path);
    if (!this.editor || !model) { this.active.set(path); return; }
    const previous = this.active();
    if (previous && previous !== path && this.editor.getModel()) this.viewStates.set(previous, this.editor.saveViewState());
    this.editor.setModel(model);
    const state = this.viewStates.get(path);
    if (state) this.editor.restoreViewState(state as Parameters<MonacoEditor['restoreViewState']>[0]);
    this.active.set(path);
  }

  protected open(path: string): void {
    if (!this.tabs().includes(path)) this.tabs.update(t => [...t, path]);
    this.showFile(path);
    if (window.matchMedia?.('(max-width: 900px)').matches) this.explorerOpen.set(false);
    this.editor?.focus();
  }

  protected closeTab(path: string, event?: Event): void {
    event?.stopPropagation();
    const tabs = this.tabs();
    const index = tabs.indexOf(path);
    const next = tabs.filter(t => t !== path);
    this.tabs.set(next);
    if (this.active() === path) {
      const target = next[Math.min(index, next.length - 1)];
      if (target) this.showFile(target);
      else { this.editor?.setModel(null); this.active.set(null); }
    }
  }

  protected tabName(path: string): string { return nameOf(path); }

  protected format(): void {
    void this.editor?.getAction('editor.action.formatDocument')?.run();
  }

  private async loadAngularTypes(monaco: MonacoApi): Promise<void> {
    angularTypes ??= (async () => {
      const base = new URL('runners/angular/types/', document.baseURI).href;
      const list: string[] = await (await fetch(base + 'manifest.json')).json();
      const ts = typescriptApi(monaco);
      await Promise.all(list.map(async path => {
        const content = await (await fetch(base + path)).text();
        ts.typescriptDefaults.addExtraLib(content, `file:///node_modules/${path}`);
      }));
    })().catch(() => { angularTypes = null; });
    await angularTypes;
  }

  private collectMarkers(): void {
    if (!this.monaco || this.kind() === 'CSharp') return;
    const problems: Problem[] = [];
    for (const [path, model] of this.models) {
      for (const m of this.monaco.editor.getModelMarkers({ resource: model.uri })) {
        if (m.severity < this.monaco.MarkerSeverity.Warning) continue;
        problems.push({ file: path, line: m.startLineNumber, column: m.startColumn,
          severity: m.severity === this.monaco.MarkerSeverity.Error ? 'error' : 'warning', message: m.message });
      }
    }
    this.problems.set(problems);
  }

  protected goTo(problem: Problem): void {
    this.open(problem.file);
    this.editor?.revealLineInCenter(problem.line);
    this.editor?.setPosition({ lineNumber: problem.line, column: problem.column });
    this.editor?.focus();
  }

  // ---------- Running ----------

  protected async run(): Promise<void> {
    if (this.running() || !this.runnable()) return;
    this.running.set(true);
    this.consoleLines.set([]);
    this.sqlHint.set(null);
    const started = performance.now();
    let ok = true;
    try {
      switch (this.kind()) {
        case 'CSharp': ok = await this.runCSharp(); break;
        case 'Sql': ok = await this.runSql(); break;
        case 'JavaScript': case 'TypeScript': ok = await this.runScript(); break;
        case 'Web': case 'Angular': ok = await this.renderPreview(); break;
      }
    } catch (e) {
      ok = false;
      this.reportRunError(e);
    } finally {
      this.running.set(false);
      this.lastRun.set({ ms: Math.round(performance.now() - started), ok });
    }
  }

  protected async runTests(): Promise<void> {
    const tests = this.tests();
    if (!tests || this.running()) return;
    this.running.set(true);
    this.consoleLines.set([]);
    this.panel.set('tests');
    try {
      let results: TestResult[] = [];
      if (this.kind() === 'CSharp') {
        const r = await this.runner.runCSharp({ files: this.codeFiles('.cs'), tests }, 20000);
        this.showCSharpDiagnostics(r.diagnostics);
        if (!r.compiled) { this.panel.set('problems'); this.testResults.set([]); return; }
        if (r.output) this.print('log', r.output);
        results = r.tests ?? [];
      } else if (this.kind() === 'Sql') {
        results = await this.runSqlChecks(tests);
      } else {
        const code = await this.scriptCode();
        const r = await this.runner.runJavaScript({ code, tests });
        r.logs.forEach(l => this.print(l.level, l.text));
        if (r.error) { this.print('error', r.error); }
        results = r.tests ?? [];
      }
      this.testResults.set(results);
      if (results.length) this.testsFinished.emit({ passed: results.filter(t => t.passed).length, total: results.length });
    } catch (e) {
      this.reportRunError(e);
    } finally {
      this.running.set(false);
    }
  }

  protected async stop(): Promise<void> {
    const engine = this.engine();
    if (engine) await this.runner.stop(engine);
    this.running.set(false);
    this.print('system', this.i18n.t('ide.stopped'));
  }

  private codeFiles(ext: string): WorkspaceFile[] {
    return realFiles(this.workspace()).filter(f => f.path.endsWith(ext));
  }

  private async runCSharp(): Promise<boolean> {
    const files = this.codeFiles('.cs');
    if (!files.length) { this.print('system', this.i18n.t('ide.noCode')); return false; }
    if (this.runner.status().csharp !== 'ready') this.print('system', this.i18n.t('ide.loadingCompiler'));
    const r = await this.runner.runCSharp({ files, stdin: this.stdin() });
    this.showCSharpDiagnostics(r.diagnostics);
    if (!r.compiled) {
      this.print('error', this.i18n.t('ide.compileFailed', { n: r.diagnostics.filter(d => d.severity === 'error').length }));
      this.panel.set('problems');
      return false;
    }
    this.consoleLines.set([]);
    if (r.output) this.print('log', r.output.replace(/\n$/, ''));
    if (r.outputTruncated) this.print('warn', this.i18n.t('ide.outputTruncated'));
    if (r.exception) this.print('error', r.exception);
    this.print('system', this.i18n.t('ide.finishedIn', { ms: r.compileMs + r.runMs }));
    this.panel.set('output');
    return !r.exception;
  }

  private showCSharpDiagnostics(diagnostics: { file: string; line: number; column: number; endLine: number; endColumn: number; severity: 'error' | 'warning'; message: string; id: string }[]): void {
    this.problems.set(diagnostics.map(d => ({ file: d.file, line: d.line, column: d.column, severity: d.severity, message: `${d.id}: ${d.message}` })));
    if (!this.monaco) return;
    for (const [path, model] of this.models) {
      this.monaco.editor.setModelMarkers(model, 'csharp', diagnostics.filter(d => d.file === path).map(d => ({
        startLineNumber: d.line, startColumn: d.column, endLineNumber: d.endLine, endColumn: Math.max(d.endColumn, d.column + 1),
        message: `${d.id}: ${d.message}`,
        severity: d.severity === 'error' ? this.monaco!.MarkerSeverity.Error : this.monaco!.MarkerSeverity.Warning,
      })));
    }
  }

  /** The SQL to run: the selected text, or the whole file that is open. */
  private sqlToRun(): string {
    const selection = this.editor?.getSelection();
    const model = this.editor?.getModel();
    if (selection && model && !selection.isEmpty()) return model.getValueInRange(selection);
    const active = this.active();
    const file = this.workspace().find(f => f.path === active && f.path.endsWith('.sql')) ?? this.codeFiles('.sql')[0];
    return file?.content ?? '';
  }

  private async runSql(): Promise<boolean> {
    const source = this.sqlToRun();
    if (!source.trim()) { this.print('system', this.i18n.t('ide.noCode')); return false; }
    const { sql, conversions } = rewriteTsql(source);
    this.sqlConversions.set(conversions);
    const r = await this.runner.runSql({ sql, setup: datasetSetup(this.dataset()), fresh: this.mode() === 'exercise' });
    this.sqlResult.set(r);
    this.schema.set(r.schema);
    setSqlCompletionSchema(r.schema);
    r.messages.forEach(m => this.print('log', m));
    if (r.error) {
      this.print('error', r.error.message + (r.error.statement ? `\n→ ${r.error.statement.trim()}` : ''));
      this.sqlHint.set(sqlErrorHint(r.error.message));
    }
    this.print('system', this.i18n.t('ide.finishedIn', { ms: r.durationMs }));
    this.panel.set(r.results.length ? 'results' : 'output');
    return !r.error;
  }

  private async runSqlChecks(tests: string): Promise<TestResult[]> {
    const checks = parseSqlChecks(tests);
    const source = this.codeFiles('.sql').map(f => f.content).join('\n');
    const { sql, conversions } = rewriteTsql(source);
    this.sqlConversions.set(conversions);
    const r = await this.runner.runSql({ sql, setup: datasetSetup(this.dataset()), fresh: true, checks: checks.filter(c => c.sql).map(c => c.sql!) });
    this.sqlResult.set(r);
    const ar = this.i18n.lang() === 'ar';
    if (r.error) {
      this.print('error', r.error.message);
      this.sqlHint.set(sqlErrorHint(r.error.message));
      return checks.map(c => ({ name: ar ? c.nameAr : c.nameEn, passed: false, message: this.i18n.t('ide.sqlCheck.error') }));
    }
    let checkIndex = 0;
    const last = r.results[r.results.length - 1];
    return checks.map(c => {
      const actual = c.sql ? r.checkResults?.[checkIndex++] : last;
      const problem = compareResult(actual, c);
      return { name: ar ? c.nameAr : c.nameEn, passed: !problem, message: problem ? this.i18n.t('ide.sqlCheck.' + problem) : null };
    });
  }

  protected async refreshSchema(reset = false): Promise<void> {
    try {
      const tables = reset ? await this.runner.resetSql(datasetSetup(this.dataset())) : await this.runner.sqlSchema();
      this.schema.set(tables);
      setSqlCompletionSchema(tables);
      if (reset) { this.sqlResult.set(null); }
    } catch (e) {
      this.reportRunError(e);
    }
  }

  protected async resetDatabase(): Promise<void> {
    await this.refreshSchema(true);
    this.print('system', this.i18n.t('ide.databaseReset'));
  }

  protected insertTable(name: string): void {
    const editor = this.editor;
    if (!editor || this.readonly()) return;
    const selection = editor.getSelection();
    if (selection) editor.executeEdits('schema', [{ range: selection, text: name }]);
    editor.focus();
  }

  private async scriptCode(): Promise<string> {
    const ext = this.kind() === 'TypeScript' ? ['.ts', '.js'] : ['.js'];
    const files = realFiles(this.workspace()).filter(f => ext.some(e => f.path.endsWith(e)));
    const modules = this.kind() === 'TypeScript' && this.monaco ? await compileTypeScript(this.monaco, files) : files.map(f => ({ path: f.path, code: f.content }));
    const entry = this.entry() && modules.some(m => m.path === this.entry()) ? this.entry()! : modules[0]?.path ?? '';
    return joinScripts(modules, entry);
  }

  private async runScript(): Promise<boolean> {
    const code = await this.scriptCode();
    if (!code.trim()) { this.print('system', this.i18n.t('ide.noCode')); return false; }
    const r = await this.runner.runJavaScript({ code });
    r.logs.forEach(l => this.print(l.level, l.text));
    if (r.error) this.print('error', r.error);
    this.print('system', this.i18n.t('ide.finishedIn', { ms: r.durationMs }));
    this.panel.set('output');
    return !r.error;
  }

  // ---------- Preview (HTML and Angular) ----------

  private async renderPreview(): Promise<boolean> {
    const frame = this.previewFrame()?.nativeElement;
    if (!frame || !this.monaco) return false;
    let payload: Record<string, unknown>;
    if (this.kind() === 'Angular') {
      const files = realFiles(this.workspace());
      const ts = files.filter(f => /\.ts$/.test(f.path) && !f.path.endsWith('.d.ts'));
      let modules;
      try { modules = await compileTypeScript(this.monaco, files.filter(f => ts.includes(f) || /\.(html|css)$/.test(f.path)), true); }
      catch (e) { this.print('error', e instanceof Error ? e.message : String(e)); return false; }
      const entry = files.find(f => /(^|\/)main\.ts$/.test(f.path))?.path ?? ts[0]?.path ?? '';
      payload = {
        modules, entry, html: files.find(f => /(^|\/)index\.html$/.test(f.path))?.content ?? '<app-root></app-root>',
        styles: files.filter(f => /(^|\/)styles\.(css|scss)$/.test(f.path) && !f.path.includes('/app/')).map(f => f.content),
      };
      this.collectMarkers();
      if (this.errorCount() > 0) this.print('warn', this.i18n.t('ide.typeErrors', { n: this.errorCount() }));
    } else {
      const files = realFiles(this.workspace());
      const entry = files.find(f => f.path === 'index.html')?.path ?? files.find(f => f.path.endsWith('.html'))?.path ?? 'index.html';
      payload = { files, entry };
    }
    const ready = new Promise<void>(resolve => (this.previewReady = resolve));
    frame.src = new URL(PREVIEW[this.kind()]!, document.baseURI).href + '?v=' + Date.now();
    await Promise.race([ready, new Promise(r => setTimeout(r, 10000))]);
    frame.contentWindow?.postMessage({ channel: 'devpath-preview', type: 'render', ...payload }, '*');
    this.print('system', this.i18n.t('ide.previewUpdated'));
    return true;
  }

  private onPreviewMessage(event: MessageEvent): void {
    const frame = this.previewFrame()?.nativeElement;
    if (!frame || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.channel !== 'devpath-preview') return;
    this.zone.run(() => {
      if (data.type === 'ready') { this.previewReady?.(); this.previewReady = null; }
      else if (data.type === 'console') {
        this.print(data.level, data.text);
        if (data.level === 'error' && this.panel() !== 'output') this.panel.set('output');
      }
    });
  }

  private print(level: ConsoleLine['level'], text: string): void {
    this.consoleLines.update(lines => (lines.length > 1000 ? lines.slice(-1000) : lines).concat({ level, text }));
  }

  private reportRunError(e: unknown): void {
    const message = e instanceof Error ? e.message : String(e);
    if (message === 'timeout') this.print('error', this.i18n.t('ide.timeout'));
    else if (message === 'runner_unavailable') this.print('error', this.i18n.t('ide.runnerUnavailable'));
    else this.print('error', message);
    this.panel.set('output');
  }

  protected clearConsole(): void { this.consoleLines.set([]); }

  // ---------- Explorer ----------

  protected onTree(action: TreeAction): void {
    switch (action.kind) {
      case 'open': this.open(action.path); break;
      case 'toggle': this.expanded.update(s => { const n = new Set(s); if (n.has(action.path)) n.delete(action.path); else n.add(action.path); return n; }); break;
      case 'newFile': this.startNaming('newFile', action.path); break;
      case 'newFolder': this.startNaming('newFolder', action.path); break;
      case 'rename': this.startNaming('rename', parentOf(action.path), action.path); break;
      case 'delete': void this.remove(action.path); break;
    }
  }

  protected startNaming(action: 'newFile' | 'newFolder' | 'rename', parent: string, from?: string): void {
    this.naming.set({ action, parent, from });
    this.nameDraft.set(from ? nameOf(from) : '');
    this.nameError.set(null);
    if (parent) this.expanded.update(s => new Set(s).add(parent));
    setTimeout(() => this.host.nativeElement.querySelector<HTMLInputElement>('.ide-name-input')?.focus());
  }

  protected commitName(): void {
    const naming = this.naming();
    const name = this.nameDraft().trim();
    if (!naming) return;
    if (!name) { this.naming.set(null); return; }
    const target = joinPath(naming.parent, name);
    const result = naming.action === 'newFile' ? createFile(this.workspace(), target, '')
      : naming.action === 'newFolder' ? createFolder(this.workspace(), target)
      : renamePath(this.workspace(), naming.from!, target);
    if (!result.files) { this.nameError.set('ide.errors.' + result.error); return; }
    const from = naming.from;
    this.workspace.set(result.files);
    this.naming.set(null);
    if (naming.action === 'rename' && from) {
      // Open tabs follow the renamed file or folder.
      const moved = (p: string) => (p === from ? target : p.startsWith(from + '/') ? target + p.slice(from.length) : p);
      this.tabs.update(t => t.map(moved));
      const active = this.active();
      this.syncModels();
      if (active) this.showFile(moved(active));
    } else {
      this.syncModels();
      if (naming.action === 'newFile') this.open(target);
      else this.expanded.update(s => new Set(s).add(target));
    }
    this.emitChange();
  }

  protected cancelNaming(): void { this.naming.set(null); }

  private async remove(path: string): Promise<void> {
    const ok = await this.confirm.ask({ message: this.i18n.t('ide.deleteConfirm', { name: path }), danger: true, confirmText: this.i18n.t('common.delete') });
    if (!ok) return;
    this.workspace.set(deletePath(this.workspace(), path));
    this.tabs.update(t => t.filter(p => p !== path && !p.startsWith(path + '/')));
    const active = this.active();
    this.syncModels();
    if (active && (active === path || active.startsWith(path + '/'))) {
      const next = this.tabs()[0];
      if (next) this.showFile(next); else { this.editor?.setModel(null); this.active.set(null); }
    }
    this.emitChange();
  }

  protected isKeep(path: string): boolean { return nameOf(path) === FOLDER_KEEP; }

  // ---------- Project actions ----------

  protected download(): void {
    const blob = createZip(realFiles(this.workspace()), this.name());
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.name().replace(/[^A-Za-z0-9_-]+/g, '-') || 'project'}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  protected chooseImport(): void { this.importInput().nativeElement.click(); }

  protected async importFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const files = await readZip(await file.arrayBuffer());
        if (!files.length) { this.toast.error(this.i18n.t('ide.importEmpty')); return; }
        if (!(await this.confirm.ask({ message: this.i18n.t('ide.importReplace', { n: files.length }) }))) return;
        this.load(files, this.entry());
      } else {
        if (file.size > 200_000) { this.toast.error(this.i18n.t('ide.importTooLarge')); return; }
        const result = createFile(this.workspace(), file.name, await file.text());
        if (!result.files) { this.toast.error(this.i18n.t('ide.errors.' + result.error)); return; }
        this.workspace.set(result.files);
        this.syncModels();
        this.open(file.name);
      }
      this.emitChange();
    } catch (e) {
      this.toast.error(this.i18n.t(e instanceof Error && e.message === 'too_large' ? 'ide.importTooLarge' : 'ide.importFailed'));
    }
  }

  protected async toggleFullscreen(): Promise<void> {
    const element = this.host.nativeElement;
    if (!this.fullscreen()) {
      this.fullscreen.set(true);
      try { await element.requestFullscreen?.(); } catch { /* the CSS class still fills the window */ }
    } else {
      this.fullscreen.set(false);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    }
    setTimeout(() => this.editor?.layout());
  }

  // ---------- Resizable panels ----------

  protected startResize(event: PointerEvent, which: 'explorer' | 'preview' | 'panel'): void {
    event.preventDefault();
    const host = this.host.nativeElement;
    const style = host.style;
    const rtl = this.isRtl();
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = host.getBoundingClientRect();
    const start = {
      explorer: parseFloat(getComputedStyle(host).getPropertyValue('--ide-explorer')) || 220,
      preview: parseFloat(getComputedStyle(host).getPropertyValue('--ide-preview')) || rect.width * 0.4,
      panel: parseFloat(getComputedStyle(host).getPropertyValue('--ide-panel')) || 220,
    };
    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const dx = (e.clientX - startX) * (rtl ? -1 : 1);
      const dy = e.clientY - startY;
      if (which === 'explorer') style.setProperty('--ide-explorer', `${Math.min(Math.max(start.explorer + dx, 150), 420)}px`);
      if (which === 'preview') style.setProperty('--ide-preview', `${Math.min(Math.max(start.preview - dx, 220), rect.width * 0.7)}px`);
      if (which === 'panel') style.setProperty('--ide-panel', `${Math.min(Math.max(start.panel - dy, 90), rect.height * 0.75)}px`);
    };
    const up = () => { target.removeEventListener('pointermove', move); target.removeEventListener('pointerup', up); this.editor?.layout(); };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
  }

  protected resizeWithKeys(event: KeyboardEvent, which: 'explorer' | 'preview' | 'panel'): void {
    const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -20 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 20 : 0;
    if (!step) return;
    event.preventDefault();
    const host = this.host.nativeElement;
    const variable = `--ide-${which}`;
    const current = parseFloat(getComputedStyle(host).getPropertyValue(variable)) || (which === 'explorer' ? 220 : which === 'panel' ? 220 : 420);
    const sign = which === 'explorer' ? (this.isRtl() ? -1 : 1) : -1;
    host.style.setProperty(variable, `${Math.max(90, current + step * sign)}px`);
    this.editor?.layout();
  }
}

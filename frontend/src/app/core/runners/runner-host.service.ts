import { DOCUMENT } from '@angular/common';
import { Injectable, NgZone, inject, signal } from '@angular/core';
import { WorkspaceFile } from '../models';
import { loadRunnerAsset, runnerAssetUrl } from './runner-assets';

/** Engines that run in the runner host (runners/host.html). HTML and Angular previews use their own pages. */
export type RunnerEngine = 'csharp' | 'sql' | 'javascript';
export type EngineStatus = 'idle' | 'loading' | 'ready' | 'running' | 'failed';

export interface CSharpDiagnostic {
  file: string; line: number; column: number; endLine: number; endColumn: number;
  severity: 'error' | 'warning'; id: string; message: string;
}
export interface TestResult { name: string; passed: boolean; message: string | null; }
export interface CSharpRunResult {
  compiled: boolean; diagnostics: CSharpDiagnostic[]; output: string; outputTruncated: boolean;
  exception: string | null; tests: TestResult[] | null; compileMs: number; runMs: number;
}

export interface SqlResultSet { columns: string[]; rows: unknown[][]; truncated: boolean; }
export interface SqlTable {
  name: string; rowCount: number;
  columns: { name: string; type: string; notNull: boolean; primaryKey: boolean }[];
  foreignKeys: { column: string; references: string }[];
}
export interface SqlRunResult {
  results: SqlResultSet[]; messages: string[];
  error: { message: string; statementIndex: number | null; statement: string | null } | null;
  checkResults: SqlResultSet[] | null; durationMs: number; schema: SqlTable[];
}

export interface JsRunResult {
  logs: { level: 'log' | 'info' | 'warn' | 'error' | 'debug'; text: string }[];
  error: string | null; tests: TestResult[] | null; durationMs: number;
}

const CHANNEL = 'devpath-runner';

/**
 * Talks to the runner host: a hidden iframe with sandbox="allow-scripts" (no allow-same-origin). Code run there
 * has an opaque origin, so it can't read the site's cookies or call the API as the learner. Each engine runs in
 * a Web Worker inside it; a request that takes too long terminates that worker (the next run starts a fresh one).
 */
@Injectable({ providedIn: 'root' })
export class RunnerHostService {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private frame: HTMLIFrameElement | null = null;
  private hostReady: Promise<void> | null = null;
  private readonly pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

  /** Per-engine state, for "Loading the C# compiler…" and similar messages. */
  readonly status = signal<Record<RunnerEngine, EngineStatus>>({ csharp: 'idle', sql: 'idle', javascript: 'idle' });
  readonly failure = signal<Partial<Record<RunnerEngine, string>>>({});

  runCSharp(request: { files: WorkspaceFile[]; tests?: string | null; stdin?: string | null }, timeoutMs = 15000) {
    return this.request<CSharpRunResult>('csharp', 'run', request, timeoutMs);
  }

  runSql(request: { sql: string; setup?: string; fresh?: boolean; checks?: string[] }, timeoutMs = 10000) {
    return this.request<SqlRunResult>('sql', 'run', request, timeoutMs);
  }

  sqlSchema() { return this.request<SqlTable[]>('sql', 'schema', {}, 10000); }

  resetSql(setup: string) { return this.request<SqlTable[]>('sql', 'reset', { setup }, 10000); }

  runJavaScript(request: { code: string; tests?: string | null }, timeoutMs = 8000) {
    return this.request<JsRunResult>('javascript', 'run', request, timeoutMs);
  }

  /** Starts an engine in the background (the C# compiler is a large download). */
  warmup(engine: RunnerEngine): void {
    void this.request(engine, 'warmup', {}, 120000).catch(() => undefined);
  }

  /** Stops a running program by terminating its worker. */
  async stop(engine: RunnerEngine): Promise<void> {
    await this.ensureHost();
    this.frame!.contentWindow!.postMessage({ channel: CHANNEL, engine, action: 'stop' }, '*');
  }

  private async request<T>(engine: RunnerEngine, action: string, payload: unknown, timeoutMs: number): Promise<T> {
    await this.ensureHost();
    const id = crypto.randomUUID();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.frame!.contentWindow!.postMessage({ channel: CHANNEL, id, engine, action, payload, timeoutMs }, '*');
    });
  }

  /** Answers an engine's request for one of its files, from the cache when possible (see runner-assets.ts). */
  private async serveAsset(frame: HTMLIFrameElement, data: { engine: RunnerEngine; assetId: number; url: string }): Promise<void> {
    const reply = (message: object, transfer: Transferable[] = []) =>
      frame.contentWindow?.postMessage({ channel: CHANNEL, type: 'asset', assetId: data.assetId, ...message }, '*', transfer);
    const url = runnerAssetUrl(String(data.url), this.document.baseURI);
    if (!url) { reply({ ok: false, message: 'Not a runner file.' }); return; }
    try {
      const asset = await loadRunnerAsset(url);
      reply({ ok: true, body: asset.body, contentType: asset.contentType }, [asset.body]);
    } catch (e) {
      reply({ ok: false, message: String((e as Error)?.message ?? e) });
    }
  }

  private ensureHost(): Promise<void> {
    this.hostReady ??= new Promise<void>((resolve, reject) => {
      const frame = this.document.createElement('iframe');
      frame.src = new URL('runners/host.html', this.document.baseURI).href;
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.title = 'Code runner';
      frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
      const timer = setTimeout(() => { this.hostReady = null; frame.remove(); reject(new Error('runner_unavailable')); }, 20000);
      this.zone.runOutsideAngular(() => window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow) return;
        const data = event.data;
        if (!data || data.channel !== CHANNEL) return;
        if (data.type === 'asset-request') { void this.serveAsset(frame, data); return; }
        this.zone.run(() => {
          if (data.type === 'status' && data.engine === 'host') {
            clearTimeout(timer);
            frame.contentWindow!.postMessage({ channel: CHANNEL, type: 'assets-supported' }, '*');
            resolve();
            return;
          }
          if (data.type === 'status') {
            this.status.update(s => ({ ...s, [data.engine]: data.status }));
            if (data.status === 'failed') this.failure.update(f => ({ ...f, [data.engine]: data.message }));
            return;
          }
          const job = data.id && this.pending.get(data.id);
          if (!job) return;
          this.pending.delete(data.id);
          if (data.type === 'error') job.reject(new Error(data.message));
          else job.resolve(data.result);
        });
      }));
      this.document.body.appendChild(frame);
      this.frame = frame;
    });
    return this.hostReady;
  }
}

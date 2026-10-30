// Publishes the in-browser C# runner (backend/DevPath.CodeRunner) into public/runners/csharp,
// where the Angular build picks it up. Run it before `ng build` / `ng serve`: npm run build:runners
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const project = resolve(root, '../backend/DevPath.CodeRunner/DevPath.CodeRunner.csproj');
const target = resolve(root, 'public/runners/csharp');
const out = mkdtempSync(join(tmpdir(), 'devpath-csharp-runner-'));

try {
  execFileSync('dotnet', ['publish', project, '-c', 'Release', '-o', out, '--nologo'], { stdio: 'inherit' });
  const published = join(out, 'wwwroot');
  if (!existsSync(join(published, '_framework', 'dotnet.js'))) throw new Error('The runner publish output has no _framework/dotnet.js.');
  rmSync(target, { recursive: true, force: true });
  cpSync(published, target, { recursive: true });
  console.log(`C# runner copied to ${target}`);
} finally {
  rmSync(out, { recursive: true, force: true });
}

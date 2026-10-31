import { runnerAssetUrl } from './runner-assets';

describe('runnerAssetUrl', () => {
  const base = 'https://devpath.test/';

  it('accepts the runners’ own files', () => {
    expect(runnerAssetUrl('https://devpath.test/runners/csharp/_framework/System.Linq.4ax3k1b9z2.wasm', base)?.pathname)
      .toBe('/runners/csharp/_framework/System.Linq.4ax3k1b9z2.wasm');
    expect(runnerAssetUrl('https://devpath.test/runners/sql/sql-wasm.wasm', base)).not.toBeNull();
  });

  it('refuses anything the sandbox must not read with the site’s origin', () => {
    for (const url of [
      'https://devpath.test/api/auth/me',
      'https://devpath.test/runners/../api/notes',
      'https://devpath.test/runners/%2e%2e/api/notes',
      'https://devpath.test/runners/sql/sql-wasm.wasm?x=1',
      'https://evil.test/runners/sql/sql-wasm.wasm',
      'not a url',
    ]) expect(runnerAssetUrl(url, base), url).toBeNull();
  });
});

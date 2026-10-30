import { inlineComponentResources, joinScripts } from './ts-compile';

describe('inlineComponentResources', () => {
  const files = [
    { path: 'src/app/app.component.html', content: '<h1>{{ title }}</h1>' },
    { path: 'src/app/app.component.css', content: 'h1 { color: red; }' },
    { path: 'src/styles/shared.css', content: 'p {}' },
  ];

  it('turns templateUrl and styleUrl(s) into inline template and styles', () => {
    const source = `@Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrl: './app.component.css' })`;
    const out = inlineComponentResources({ path: 'src/app/app.component.ts', content: source }, files);
    expect(out).toContain('template: "<h1>{{ title }}</h1>"');
    expect(out).toContain('styles: ["h1 { color: red; }"]');
    const many = inlineComponentResources({ path: 'src/app/x.ts', content: "styleUrls: ['./app.component.css', '../styles/shared.css']" }, files);
    expect(many).toBe('styles: ["h1 { color: red; }", "p {}"]');
  });

  it('reports a missing file', () => {
    expect(() => inlineComponentResources({ path: 'src/a.ts', content: "templateUrl: './missing.html'" }, files)).toThrow('missing.html');
  });
});

describe('joinScripts', () => {
  it('drops local imports and export keywords and runs the entry last', () => {
    const code = joinScripts([
      { path: 'main.js', code: "import { add } from './math.js';\nconsole.log(add(1, 2));" },
      { path: 'math.js', code: 'export function add(a, b) { return a + b; }\nexport const PI = 3.14;' },
    ], 'main.js');
    expect(code).not.toContain('import');
    expect(code).not.toContain('export');
    expect(code.indexOf('function add')).toBeLessThan(code.indexOf('console.log'));
  });
});

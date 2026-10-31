import { addSignalMetadata, inlineComponentResources, joinScripts } from './ts-compile';

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

describe('addSignalMetadata', () => {
  const source = [
    "import { Component, ElementRef, booleanAttribute, input, model, output, viewChild } from '@angular/core';",
    "@Component({ selector: 'app-x', template: '' })",
    'export class X {',
    '  readonly value = input(0);',
    "  readonly name = input.required<string>({ alias: 'label' });",
    '  disabled = input(false, { transform: booleanAttribute });',
    '  readonly checked = model<boolean>(false);',
    '  readonly rated = output<number>();',
    "  private readonly box = viewChild<ElementRef>('box', { read: ElementRef });",
    '  readonly plain = 5;',
    '}',
  ].join('\n');
  const out = addSignalMetadata(source);

  it('adds the JIT metadata the Angular CLI would add for signal inputs, models, outputs and queries', () => {
    expect(out).toContain('@__dpInput({ isSignal: true, alias: "value", required: false, transform: undefined }) readonly value = input(0);');
    expect(out).toContain('@__dpInput({ isSignal: true, alias: "label", required: true, transform: undefined }) readonly name');
    expect(out).toContain('@__dpInput({ isSignal: true, alias: "disabled", required: false, transform: booleanAttribute }) disabled = input(false');
    expect(out).toContain('@__dpInput({ isSignal: true, alias: "checked", required: false, transform: undefined }) @__dpOutput("checkedChange") readonly checked');
    expect(out).toContain('@__dpOutput("rated") readonly rated');
    expect(out).toContain("@__dpViewChild('box', { isSignal: true, read: ElementRef }) private readonly box");
    expect(out).toContain('\n  readonly plain = 5;');
    expect(out.split('\n')[0]).toBe("import { Input as __dpInput, Output as __dpOutput, ViewChild as __dpViewChild } from '@angular/core';");
  });

  it('leaves files that don’t use Angular untouched', () => {
    const plain = 'const value = input(1);';
    expect(addSignalMetadata(plain)).toBe(plain);
  });
});


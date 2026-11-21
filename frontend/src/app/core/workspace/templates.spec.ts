import { templateByKey, templateForLanguage } from './templates';

describe('Playground templates', () => {
  it('opens the code of a library step in a template that can run it', () => {
    expect(templateForLanguage('csharp')).toBe('csharp-console');
    expect(templateForLanguage('SQL')).toBe('sql-empty');
    expect(templateForLanguage('typescript')).toBe('typescript');
    expect(templateForLanguage('dockerfile')).toBeNull();
    expect(templateForLanguage(null)).toBeNull();
    for (const lang of ['csharp', 'sql', 'typescript', 'javascript']) expect(templateByKey(templateForLanguage(lang))).toBeDefined();
  });
});

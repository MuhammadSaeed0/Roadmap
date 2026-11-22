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

describe('Running a topic lesson example', () => {
  it('knows the tables of every SQL sample database', async () => {
    const { SQL_DATASETS } = await import('../runners/sql-datasets');
    const { SQL_DATASET_TABLES } = await import('./templates');
    for (const [key, tables] of Object.entries(SQL_DATASET_TABLES)) {
      const created = [...SQL_DATASETS[key as keyof typeof SQL_DATASETS].setup.matchAll(/CREATE TABLE\s+(\w+)/gi)].map(m => m[1].toLowerCase()).sort();
      expect(created, key).toEqual([...tables].sort());
    }
  });

  it('opens each language in the editor that runs it', async () => {
    const { lessonTemplate } = await import('./templates');
    expect(lessonTemplate('csharp', 'Console.WriteLine("Hi");')).toBe('csharp-console');
    expect(lessonTemplate('typescript', 'console.log(1 + 1);', '2')).toBe('typescript');
    // A TypeScript fragment with no printed output (an Angular class, part of a file) doesn't run on its own.
    expect(lessonTemplate('typescript', '@Component({}) export class A {}', null)).toBeNull();
    expect(lessonTemplate('html', '<h1>Hi</h1>')).toBe('web');
    // SQL: the sample database the query uses, an empty one when it creates its own tables.
    expect(lessonTemplate('sql', 'SELECT s.Name FROM Students s JOIN Enrollments e ON e.StudentId = s.Id;')).toBe('sql-school');
    expect(lessonTemplate('sql', 'INSERT INTO Students (Name) VALUES (N\'Mona\'); -- From the first lesson')).toBe('sql-school');
    expect(lessonTemplate('sql', 'SELECT * FROM Orders o JOIN Customers c ON c.Id = o.CustomerId;')).toBe('sql-shop');
    expect(lessonTemplate('sql', 'CREATE TABLE Notes (Id int); INSERT INTO Notes VALUES (1); SELECT * FROM Notes;')).toBe('sql-empty');
    // Code the browser can't run gets no button.
    expect(lessonTemplate('sql', 'SELECT * FROM sys.indexes;')).toBeNull();
    expect(lessonTemplate('aspnet', 'app.MapGet("/", () => "Hi");')).toBeNull();
    expect(lessonTemplate('bash', 'dotnet new console')).toBeNull();
    expect(lessonTemplate('csharp', '   ')).toBeNull();
  });
});

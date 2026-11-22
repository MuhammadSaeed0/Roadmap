import { parseCreateTables, withPracticeData } from './sql-practice';

describe('Practice data for SQL lesson examples', () => {
  it('reads the columns the example creates', () => {
    const [table] = parseCreateTables(`CREATE TABLE Courses (
      Id INT IDENTITY(1,1) PRIMARY KEY,
      Title NVARCHAR(100) NOT NULL,
      Price DECIMAL(8,2) NULL,
      CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );`);
    expect(table.name).toBe('Courses');
    expect(table.columns.map(c => [c.name, c.type, c.identity, c.hasDefault])).toEqual([
      ['Id', 'INT', true, false], ['Title', 'NVARCHAR', false, false], ['Price', 'DECIMAL', false, false], ['CreatedAt', 'DATETIME2', false, true],
    ]);
  });

  it('adds rows that fit the columns and a SELECT after the example, skipping identity and default columns', () => {
    const code = 'CREATE TABLE Students (\n  Id INT PRIMARY KEY,\n  Name NVARCHAR(50) NOT NULL,\n  City NVARCHAR(50) NOT NULL,\n  Year INT NOT NULL,\n  Gpa DECIMAL(3,2) NULL\n);';
    const full = withPracticeData(code);
    expect(full.startsWith(code)).toBe(true);
    expect(full).toContain('INSERT INTO Students (Id, Name, City, Year, Gpa) VALUES');
    expect(full).toContain("(1, N'Mona Ali', N'Cairo', 1, 3.40)");
    expect(full.trimEnd().endsWith('SELECT * FROM Students;')).toBe(true);

    const courses = withPracticeData('CREATE TABLE Courses (Id INT IDENTITY(1,1) PRIMARY KEY, Title NVARCHAR(100) NOT NULL, Hours TINYINT NOT NULL, CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());');
    expect(courses).toContain('INSERT INTO Courses (Title, Hours) VALUES');
  });

  it('creates stand-ins for tables the example refers to, before it, with distinct key pairs', () => {
    const code = 'CREATE TABLE Enrollments (\n  StudentId INT NOT NULL REFERENCES Students(Id),\n  CourseId INT NOT NULL REFERENCES Courses(Id),\n  Grade INT NULL,\n  PRIMARY KEY (StudentId, CourseId)\n);';
    const full = withPracticeData(code);
    expect(full.indexOf('CREATE TABLE Students')).toBeLessThan(full.indexOf(code));
    expect(full.indexOf('CREATE TABLE Courses')).toBeLessThan(full.indexOf(code));
    expect(full).toContain('INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES');
    const pairs = [...full.matchAll(/\((\d), (\d), \d+\)/g)].map(m => m[1] + m[2]);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('leaves examples that create no table as they are', () => {
    expect(withPracticeData('SELECT * FROM Students;')).toBe('SELECT * FROM Students;');
  });
});

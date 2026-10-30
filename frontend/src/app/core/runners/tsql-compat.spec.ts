import { rewriteTsql, sqlErrorHint, tokenize } from './tsql-compat';

const sql = (s: string) => rewriteTsql(s).sql;
const codes = (s: string) => rewriteTsql(s).conversions.map(c => c.code);

describe('rewriteTsql', () => {
  it('turns TOP into LIMIT at the end of the statement', () => {
    expect(sql('SELECT TOP (3) Name FROM Products ORDER BY Price DESC;')).toBe('SELECT Name FROM Products ORDER BY Price DESC LIMIT 3;');
    expect(sql('select distinct top 5 City from Customers')).toBe('select distinct City from Customers LIMIT 5;');
    expect(codes('SELECT TOP 1 * FROM T')).toEqual(['top']);
  });

  it('makes an INT IDENTITY primary key an autoincrementing SQLite key', () => {
    expect(sql('CREATE TABLE P (Id INT IDENTITY(1,1) PRIMARY KEY, Name NVARCHAR(100) NOT NULL);'))
      .toBe('CREATE TABLE P (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name NVARCHAR(100) NOT NULL);');
    expect(sql('CREATE TABLE P (Id INT IDENTITY NOT NULL PRIMARY KEY);')).toBe('CREATE TABLE P (Id INTEGER PRIMARY KEY AUTOINCREMENT);');
  });

  it('converts common functions and syntax', () => {
    expect(sql("SELECT ISNULL(Note, ''), LEN(Name), GETDATE() FROM T")).toBe("SELECT IFNULL(Note, ''), LENGTH(Name), CURRENT_TIMESTAMP FROM T;");
    expect(sql('SELECT * FROM T ORDER BY Id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY')).toBe('SELECT * FROM T ORDER BY Id LIMIT 10 OFFSET 20;');
    expect(sql('SELECT YEAR(OrderDate) FROM dbo.Orders')).toBe("SELECT CAST(strftime('%Y', OrderDate) AS INTEGER) FROM Orders;");
    expect(sql('CREATE TABLE N (Body NVARCHAR(MAX))')).toBe('CREATE TABLE N (Body NVARCHAR);');
    expect(sql('BEGIN TRAN; ROLLBACK TRAN;')).toBe('BEGIN TRANSACTION;\nROLLBACK TRANSACTION;');
  });

  it('drops USE, CREATE DATABASE and GO, and reports them', () => {
    const r = rewriteTsql('CREATE DATABASE Shop;\nGO\nUSE Shop;\nGO\nSELECT 1;');
    expect(r.sql).toBe('SELECT 1;');
    expect(r.conversions.filter(c => c.code === 'database')).toHaveLength(2);
  });

  it('removes the N prefix from Unicode strings but never touches text inside strings or comments', () => {
    expect(sql("INSERT INTO T (Name) VALUES (N'كتاب')")).toBe("INSERT INTO T (Name) VALUES ('كتاب');");
    expect(sql("SELECT 'GETDATE() and TOP 3' AS t -- LEN(x) here\n")).toBe("SELECT 'GETDATE() and TOP 3' AS t -- LEN(x) here;");
    expect(sql('SELECT [LEN] FROM [dbo.Table]')).toBe('SELECT [LEN] FROM [dbo.Table];');
    expect(codes("SELECT 'It''s ISNULL(x)'")).toEqual([]);
  });

  it('turns PRINT into a one-row SELECT', () => {
    expect(sql("PRINT 'Done';")).toBe("SELECT 'Done' AS Message;");
  });

  it('leaves plain SQLite-compatible SQL unchanged', () => {
    const plain = 'SELECT c.Name, COUNT(*) AS Products FROM Categories c JOIN Products p ON p.CategoryId = c.Id GROUP BY c.Name HAVING COUNT(*) > 1;';
    expect(rewriteTsql(plain)).toEqual({ sql: plain, conversions: [] });
  });
});

describe('tokenize', () => {
  it('keeps doubled quotes inside one string token', () => {
    expect(tokenize("SELECT 'a''b', x").map(t => t.kind)).toEqual(['code', 'string', 'code']);
  });
});

describe('sqlErrorHint', () => {
  it('recognises SQL Server-only syntax and constraint errors', () => {
    expect(sqlErrorHint('no such function: DATEADD')).toBe('function');
    expect(sqlErrorHint('FOREIGN KEY constraint failed')).toBe('foreignKey');
    expect(sqlErrorHint('something else')).toBeNull();
  });
});

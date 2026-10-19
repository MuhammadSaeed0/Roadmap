public interface IReportWriter { string Write(IEnumerable<SalesRow> rows); }

public class CsvReportWriter : IReportWriter
{
    public string Write(IEnumerable<SalesRow> rows) =>
        string.Join('\n', rows.Select(r => $"{r.Month},{r.Total}"));
}

// ReportGenerator HAS-A writer instead of IS-A CsvWriter
public class ReportGenerator(IReportWriter writer)
{
    public string Generate(IEnumerable<SalesRow> rows) => writer.Write(rows.OrderBy(r => r.Month));
}

var report = new ReportGenerator(new CsvReportWriter()).Generate(rows);

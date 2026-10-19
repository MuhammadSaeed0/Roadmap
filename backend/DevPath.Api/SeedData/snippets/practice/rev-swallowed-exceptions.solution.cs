public async Task<ImportResult> ImportAsync(IEnumerable<string[]> rows, CancellationToken ct)
{
    var result = new ImportResult();
    var line = 0;
    foreach (var row in rows)
    {
        line++;
        if (row.Length < 3 || !decimal.TryParse(row[2], CultureInfo.InvariantCulture, out var credit))
        {
            result.Rejected.Add((line, "Invalid credit limit"));
            continue;
        }
        db.Customers.Add(new Customer(row[0], row[1], credit));
        result.Imported++;
    }
    await db.SaveChangesAsync(ct);    // unexpected failures surface instead of vanishing
    logger.LogInformation("Import finished: {Imported} imported, {Rejected} rejected", result.Imported, result.Rejected.Count);
    return result;
}

public void Process() { try { Run(); } catch (Exception ex) { logger.LogError(ex, "Run failed"); throw; } }

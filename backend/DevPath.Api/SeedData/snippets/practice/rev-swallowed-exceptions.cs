public async Task ImportAsync(IEnumerable<string[]> rows)
{
    foreach (var row in rows)
    {
        try
        {
            var customer = new Customer(row[0], row[1], decimal.Parse(row[2]));
            db.Customers.Add(customer);
            await db.SaveChangesAsync();
        }
        catch (Exception)
        {
        }
    }
}

public void Process() { try { Run(); } catch (Exception ex) { throw ex; } }

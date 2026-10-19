[HttpGet]
public List<Customer> GetAll() =>
    db.Customers
      .Include(c => c.Orders)
          .ThenInclude(o => o.Lines)
      .ToList();      // 40,000 customers × orders × lines → 18 MB of JSON

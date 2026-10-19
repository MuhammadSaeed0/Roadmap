[HttpGet("api/products/search")]
public List<Product> Search(string term, string sortBy) =>
    db.Products
      .FromSqlRaw("SELECT * FROM Products WHERE Name LIKE '%" + term + "%' ORDER BY " + sortBy)
      .ToList();

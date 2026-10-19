// ❌ string concatenation
db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = '" + name + "'");

// ✅ parameters (the interpolated value becomes @p0)
db.Products.FromSql($"SELECT * FROM Products WHERE Name = {name}");

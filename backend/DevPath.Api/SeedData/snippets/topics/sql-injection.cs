// ❌ Injectable: name = "x' OR 1=1 --" returns every row
var bad = db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = '" + name + "'");

// ✅ Parameterised
var good = db.Products.FromSql($"SELECT * FROM Products WHERE Name = {name}");

// ✅ Identifiers can't be parameters → use an allow-list
string orderColumn = sortBy switch
{
    "price" => "Price",
    "name"  => "Name",
    _       => "Id"
};
var sql = $"SELECT * FROM Products ORDER BY {orderColumn}";   // safe: value comes from our list

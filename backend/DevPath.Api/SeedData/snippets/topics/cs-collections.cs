var names = new List<string> { "Sara", "Omar" };
names.Add("Lina");

// Dictionary: O(1) lookup by key — like seeking a primary key
var productsById = new Dictionary<int, Product>();
foreach (var p in products) productsById[p.Id] = p;

if (productsById.TryGetValue(lineProductId, out var product))
    Console.WriteLine(product.Name);

// HashSet: unique values and set operations
var a = new HashSet<string> { "x@a.com", "y@a.com" };
var b = new HashSet<string> { "y@a.com", "z@a.com" };
a.IntersectWith(b);   // a = { "y@a.com" }  — like INTERSECT

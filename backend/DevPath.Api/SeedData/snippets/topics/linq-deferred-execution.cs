var numbers = new List<int> { 1, 2, 3 };
var evens = numbers.Where(n => n % 2 == 0);   // nothing runs yet

numbers.Add(4);
Console.WriteLine(string.Join(",", evens));   // 2,4 — runs NOW, sees the new item

// With EF Core: each enumeration is a database round trip
var query = db.Orders.Where(o => o.Total > 1000);
var count = query.Count();     // SQL #1: SELECT COUNT(*)
var list = query.ToList();     // SQL #2: SELECT ...

// Materialise once if you need the data several times
var snapshot = query.ToList();
var total = snapshot.Count;

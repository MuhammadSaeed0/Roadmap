var query = db.Products
    .Where(p => p.Price > 100 && p.Category.Name == "Laptops")
    .OrderBy(p => p.Name)
    .Select(p => new { p.Id, p.Name });

Console.WriteLine(query.ToQueryString());
// SELECT [p].[Id], [p].[Name]
// FROM [Products] AS [p]
// INNER JOIN [Categories] AS [c] ON [p].[CategoryId] = [c].[Id]
// WHERE [p].[Price] > 100.0 AND [c].[Name] = N'Laptops'
// ORDER BY [p].[Name]

// appsettings.Development.json
// "Logging": { "LogLevel": { "Microsoft.EntityFrameworkCore.Database.Command": "Information" } }

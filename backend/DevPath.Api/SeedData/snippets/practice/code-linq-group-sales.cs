public record OrderLine(string Category, int Quantity, decimal UnitPrice);
public record Order(DateTime Date, List<OrderLine> Lines);

// TODO: one row per (Year, Month, Category) with Total, ordered by Year, Month, Total desc
var report = orders /* ... */;

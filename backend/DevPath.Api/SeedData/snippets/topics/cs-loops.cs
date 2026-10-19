decimal total = 0;
foreach (var line in order.Lines)
{
    if (line.IsCancelled) continue;   // skip this line
    total += line.Quantity * line.UnitPrice;
}

for (int i = 1; i <= 3; i++)
    Console.WriteLine($"Attempt {i}");

// Removing while iterating: loop backwards (or use RemoveAll)
for (int i = products.Count - 1; i >= 0; i--)
    if (products[i].Stock == 0) products.RemoveAt(i);

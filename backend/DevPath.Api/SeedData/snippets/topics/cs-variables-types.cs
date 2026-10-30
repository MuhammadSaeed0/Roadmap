string productName = "Keyboard";
decimal unitPrice = 49.99m;      // decimal for money: exact, no rounding errors
int stock = 120;
bool isActive = true;
DateTime createdAt = DateTime.UtcNow;
var sku = "KB-001";              // compiler infers string

Console.WriteLine($"{productName} ({sku}): {unitPrice:C} — {stock} in stock");

// Safe conversion from text
if (int.TryParse("42", out var quantity))
    Console.WriteLine(quantity * unitPrice);

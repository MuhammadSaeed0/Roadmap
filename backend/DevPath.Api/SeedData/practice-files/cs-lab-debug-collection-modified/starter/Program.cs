var items = new List<Item> { new("Keyboard", 0), new("Mouse", 5), new("Cable", 0) };
Console.WriteLine($"Removed {Inventory.RemoveOutOfStock(items)}");

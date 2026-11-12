var inventory = new Inventory();
inventory.Add("Pen", 10);
inventory.Remove("pen", 4);
Console.WriteLine(inventory.QuantityOf("PEN"));

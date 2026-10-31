var stock = new Stock("DVP", 10);
stock.PriceChanged += (sender, e) => Console.WriteLine($"{stock.Symbol}: {e.OldPrice} → {e.NewPrice}");
stock.Price = 12;
stock.Price = 12;   // no change, no message
stock.Price = 9.5m;

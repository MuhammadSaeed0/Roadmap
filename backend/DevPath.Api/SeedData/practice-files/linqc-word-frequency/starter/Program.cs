foreach (var pair in Queries.WordFrequency("The cat and the hat"))
    Console.WriteLine($"{pair.Key}: {pair.Value}");

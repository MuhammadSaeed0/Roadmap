var errors = RequestValidator.Validate(new CreateProductRequest("", -1, 3, "Audio", "KEY-1234"));
foreach (var (field, messages) in errors)
    Console.WriteLine($"{field}: {string.Join("; ", messages)}");

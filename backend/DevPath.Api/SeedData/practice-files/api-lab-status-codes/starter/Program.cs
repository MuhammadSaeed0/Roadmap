foreach (var outcome in Enum.GetValues<OperationOutcome>())
    Console.WriteLine($"{outcome,-18} {HttpStatus.For(outcome)}");

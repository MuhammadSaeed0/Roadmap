using System.ComponentModel.DataAnnotations;

public record ProductDto(int Id, string Name, decimal Price, int Stock);

public record SaveProductRequest(
    [property: Required, StringLength(100, MinimumLength = 2)] string Name,
    [property: Range(0.01, 100000)] decimal Price,
    [property: Range(0, int.MaxValue)] int Stock);

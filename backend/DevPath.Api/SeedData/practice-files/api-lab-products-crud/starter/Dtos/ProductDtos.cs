using System.ComponentModel.DataAnnotations;

public record ProductDto(int Id, string Name, decimal Price, int Stock);

// TODO: validation attributes
public record SaveProductRequest(string Name, decimal Price, int Stock);

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    // TODO: a concurrency token
}

public record ProductDto(int Id, string Name, decimal Price);
public record UpdateProductRequest(string Name, decimal Price);

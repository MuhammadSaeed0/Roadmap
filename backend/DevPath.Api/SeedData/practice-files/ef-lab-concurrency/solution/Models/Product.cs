using System.ComponentModel.DataAnnotations;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
}

public record ProductDto(int Id, string Name, decimal Price, string Version);
public record UpdateProductRequest(string Name, decimal Price, string Version);

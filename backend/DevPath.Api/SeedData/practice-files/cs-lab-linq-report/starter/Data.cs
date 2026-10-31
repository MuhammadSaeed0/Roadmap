public record Product(int Id, string Name, string Category);
public record OrderLine(int ProductId, int Month, int Quantity, decimal UnitPrice);

public static class Data
{
    public static List<Product> Products() =>
    [
        new(1, "Headset", "Audio"), new(2, "Speakers", "Audio"), new(3, "Keyboard", "Input"),
        new(4, "Mouse", "Input"), new(5, "Monitor", "Displays"),
    ];

    public static List<OrderLine> Lines() =>
    [
        new(1, 1, 3, 79), new(2, 1, 2, 35), new(3, 2, 1, 89), new(4, 2, 5, 15.99m),
        new(1, 3, 4, 79), new(5, 3, 1, 249), new(4, 5, 2, 15.99m), new(2, 11, 6, 35),
    ];
}

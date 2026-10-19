public class PriceCalculatorTests
{
    [Fact]
    public void CalculateTotal_AppliesTax()
    {
        // Arrange
        var lines = new[] { new OrderLine(ProductId: 1, Quantity: 2, UnitPrice: 50m) };

        // Act
        var total = PriceCalculator.CalculateTotal(lines, taxRate: 0.14m);

        // Assert
        Assert.Equal(114m, total);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 10)]
    [InlineData(3, 30)]
    public void Subtotal_IsQuantityTimesPrice(int quantity, decimal expected)
    {
        var lines = new[] { new OrderLine(1, quantity, 10m) };
        Assert.Equal(expected, PriceCalculator.CalculateSubtotal(lines));
    }
}
// Run: dotnet test

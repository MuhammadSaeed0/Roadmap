using Shop;
using Xunit;

public class ShippingCalculatorTests
{
    [Theory]
    [InlineData(1000)]
    [InlineData(5000)]
    public void Orders_of_1000_or_more_ship_free(decimal subtotal) =>
        Assert.Equal(0m, ShippingCalculator.Cost(subtotal, "Aswan", 25, express: true));

    [Fact]
    public void Just_below_the_limit_pays_shipping() =>
        Assert.Equal(50m, ShippingCalculator.Cost(999.99m, "Cairo", 1));

    [Theory]
    [InlineData("Cairo", 50)]
    [InlineData("giza", 50)]
    [InlineData("Aswan", 75)]
    public void Standard_rates_depend_on_the_city(string city, decimal expected) =>
        Assert.Equal(expected, ShippingCalculator.Cost(100, city, 1));

    [Fact]
    public void Express_adds_40() =>
        Assert.Equal(90m, ShippingCalculator.Cost(100, "Cairo", 1, express: true));

    [Theory]
    [InlineData(10.0, 50)]
    [InlineData(10.1, 55)]
    [InlineData(12.0, 60)]
    [InlineData(12.5, 65)]
    public void Each_started_kilogram_over_10_adds_5(double weight, decimal expected) =>
        Assert.Equal(expected, ShippingCalculator.Cost(100, "Cairo", weight));

    [Fact]
    public void Negative_values_are_rejected()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => ShippingCalculator.Cost(-1, "Cairo", 1));
        Assert.Throws<ArgumentOutOfRangeException>(() => ShippingCalculator.Cost(100, "Cairo", -0.5));
    }
}

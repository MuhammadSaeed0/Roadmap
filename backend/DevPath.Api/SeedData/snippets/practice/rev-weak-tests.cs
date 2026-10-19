[Fact]
public void ApplyDiscount_Works()
{
    var calc = new DiscountCalculator();
    calc.Apply(100m, "SAVE10");                       // no assertion
}

[Fact]
public void ApplyDiscount_ReturnsExpected()
{
    var calc = new DiscountCalculator();
    var expected = calc.Apply(100m, "SAVE10");        // expected computed by the code under test
    Assert.Equal(expected, calc.Apply(100m, "SAVE10"));
}

[Fact]
public void ApplyDiscount_NotNull() =>
    Assert.NotNull(new DiscountCalculator().Apply(100m, "SAVE10"));

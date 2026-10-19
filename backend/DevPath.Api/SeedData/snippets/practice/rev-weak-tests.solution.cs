[Theory]
[InlineData(100, "SAVE10", 90)]
[InlineData(100, null, 100)]        // the production bug: no code must not change the total
[InlineData(100, "FREE100", 0)]
[InlineData(0, "SAVE10", 0)]
public void Apply_returns_discounted_total(decimal total, string? code, decimal expected)
{
    var calc = new DiscountCalculator(new FakeCodes(("SAVE10", 10), ("FREE100", 100)));
    Assert.Equal(expected, calc.Apply(total, code));
}

[Fact]
public void Expired_code_is_rejected()
{
    var calc = new DiscountCalculator(new FakeCodes(("OLD", 10, expired: true)));
    Assert.Throws<InvalidDiscountCodeException>(() => calc.Apply(100m, "OLD"));
}

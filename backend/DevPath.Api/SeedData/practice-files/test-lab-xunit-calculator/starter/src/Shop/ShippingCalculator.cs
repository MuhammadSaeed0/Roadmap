namespace Shop;

public static class ShippingCalculator
{
    private static readonly HashSet<string> NearCities = new(StringComparer.OrdinalIgnoreCase) { "Cairo", "Giza" };

    public static decimal Cost(decimal subtotal, string city, double weightKg, bool express = false)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(subtotal);
        ArgumentOutOfRangeException.ThrowIfNegative(weightKg);
        if (subtotal >= 1000) return 0;

        var cost = NearCities.Contains(city) ? 50m : 75m;
        if (express) cost += 40;
        if (weightKg > 10) cost += 5 * (decimal)Math.Ceiling(weightKg - 10);
        return cost;
    }
}

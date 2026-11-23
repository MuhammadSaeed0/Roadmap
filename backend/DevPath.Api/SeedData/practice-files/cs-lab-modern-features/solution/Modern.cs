public record Circle(double Radius);
public record Rectangle(double Width, double Height);
public record Order(decimal Total, bool IsVip, string Country);

public class Greeter(string name)
{
    public string Greet() => $"Hello, {name}!";
}

public static class Modern
{
    public static string Describe(object shape) => shape switch
    {
        Circle c => $"circle r={c.Radius}",
        Rectangle { Width: var w, Height: var h } when w == h => $"square {w}",
        Rectangle r => $"rectangle {r.Width}x{r.Height}",
        _ => "unknown",
    };

    public static string AgeGroup(int age) => age switch
    {
        < 0 => throw new ArgumentOutOfRangeException(nameof(age)),
        < 13 => "child",
        < 18 => "teen",
        < 65 => "adult",
        _ => "senior",
    };

    public static decimal Shipping(Order order) => order switch
    {
        { IsVip: true } => 0m,
        { Country: "EG", Total: >= 1000m } => 0m,
        _ => 50m,
    };

    public static int[] Surround(int first, int[] middle, int last) => [first, .. middle, last];
}

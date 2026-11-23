public record Circle(double Radius);
public record Rectangle(double Width, double Height);
public record Order(decimal Total, bool IsVip, string Country);

// TODO: a class Greeter with a primary constructor (string name) and a Greet() method returning "Hello, {name}!".
public class Greeter
{
    public string Greet() => throw new NotImplementedException();
}

public static class Modern
{
    // Use a switch expression with type patterns: "circle r=2", "square 3", "rectangle 2x5", anything else "unknown".
    public static string Describe(object shape) => throw new NotImplementedException();

    // Use relational patterns: under 13 "child", 13–17 "teen", 18–64 "adult", 65+ "senior"; negative ages throw ArgumentOutOfRangeException.
    public static string AgeGroup(int age) => throw new NotImplementedException();

    // Use property patterns: free shipping for VIPs, or orders of at least 1000 in "EG"; otherwise 50.
    public static decimal Shipping(Order order) => throw new NotImplementedException();

    // Use a collection expression and the spread operator: first, then the middle items, then last.
    public static int[] Surround(int first, int[] middle, int last) => throw new NotImplementedException();
}

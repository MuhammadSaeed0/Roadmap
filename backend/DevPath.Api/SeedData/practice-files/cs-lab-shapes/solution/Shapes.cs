public abstract class Shape
{
    public abstract double Area();
    public virtual string Name => GetType().Name;

    protected static double Positive(double value, string name) =>
        value >= 0 ? value : throw new ArgumentOutOfRangeException(name, "Sizes can't be negative.");
}

public class Circle(double radius) : Shape
{
    public double Radius { get; } = Positive(radius, nameof(radius));
    public override double Area() => Math.PI * Radius * Radius;
}

public class Rectangle(double width, double height) : Shape
{
    public double Width { get; } = Positive(width, nameof(width));
    public double Height { get; } = Positive(height, nameof(height));
    public override double Area() => Width * Height;
}

public class Square(double side) : Rectangle(side, side);

public static class Geometry
{
    public static double TotalArea(IEnumerable<Shape> shapes) => shapes.Sum(s => s.Area());
}

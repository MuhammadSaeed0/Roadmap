public abstract class Shape
{
    public abstract double Area();
}

public class Rectangle(double width, double height) : Shape
{
    public override double Area() => width * height;
}

public class Circle(double radius) : Shape
{
    public override double Area() => Math.PI * radius * radius;
}

public static class Shapes
{
    public static double TotalArea(IEnumerable<Shape> shapes) => shapes.Sum(s => s.Area());
}

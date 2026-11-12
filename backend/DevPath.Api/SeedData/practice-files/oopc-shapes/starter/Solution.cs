public abstract class Shape
{
    public abstract double Area();
}

public class Rectangle(double width, double height) : Shape
{
    public override double Area() => 0;   // TODO
}

public class Circle(double radius) : Shape
{
    public override double Area() => 0;   // TODO
}

public static class Shapes
{
    public static double TotalArea(IEnumerable<Shape> shapes)
    {
        // TODO
        return 0;
    }
}

public static class Tests
{
    [Test("Circle area is π r²")] public static void Circle() => Assert.Near(Math.PI, new Circle(1).Area());
    [Test("Rectangle area")] public static void Rect() => Assert.Near(6, new Rectangle(2, 3).Area());
    [Test("A Square is a Rectangle")]
    public static void Square()
    {
        Shape s = new Square(3);
        Assert.Near(9, s.Area());
        Assert.True(s is Rectangle, "Square should inherit from Rectangle");
        Assert.Equal("Square", s.Name);
    }
    [Test("Shape is abstract")] public static void Abstract() => Assert.True(typeof(Shape).IsAbstract, "Shape should be abstract");
    [Test("Total area adds every shape")] public static void Total() => Assert.Near(Math.PI + 6 + 9, Geometry.TotalArea([new Circle(1), new Rectangle(2, 3), new Square(3)]));
    [Test("Negative sizes are rejected")] public static void Negative() => Assert.Throws<ArgumentOutOfRangeException>(() => new Circle(-1));
}

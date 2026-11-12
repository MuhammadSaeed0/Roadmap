public static class Tests
{
    [Test("Rectangle area")]
    public static void T1()
    {
        Assert.Near(6, new Rectangle(2, 3).Area());
    }

    [Test("Circle area")]
    public static void T2()
    {
        Assert.Near(Math.PI * 4, new Circle(2).Area());
    }

    [Test("Total of mixed shapes")]
    public static void T3()
    {
        Assert.Near(6 + Math.PI, Shapes.TotalArea([new Rectangle(2, 3), new Circle(1)]));
    }

    [Test("No shapes")]
    public static void T4()
    {
        Assert.Near(0, Shapes.TotalArea([]));
    }

    [Test("Shape is abstract")]
    public static void T5()
    {
        Assert.True(typeof(Shape).IsAbstract, "Shape must be abstract");
    }
}

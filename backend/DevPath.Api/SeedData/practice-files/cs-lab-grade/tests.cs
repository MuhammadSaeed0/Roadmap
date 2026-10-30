public static class Tests
{
    [Test("90–100 is A")] public static void A() { Assert.Equal("A", Grades.Letter(95)); Assert.Equal("A", Grades.Letter(90)); Assert.Equal("A", Grades.Letter(100)); }
    [Test("80–89 is B")] public static void B() { Assert.Equal("B", Grades.Letter(80)); Assert.Equal("B", Grades.Letter(89)); }
    [Test("70–79 is C and 60–69 is D")] public static void CD() { Assert.Equal("C", Grades.Letter(75)); Assert.Equal("D", Grades.Letter(60)); }
    [Test("Below 60 is F")] public static void F() { Assert.Equal("F", Grades.Letter(59)); Assert.Equal("F", Grades.Letter(0)); }
    [Test("Rejects scores outside 0–100")]
    public static void Invalid()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(101));
        Assert.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(-1));
    }
}

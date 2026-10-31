public static class Tests
{
    [Test("First five values")] public static void Five() => Assert.SequenceEqual(["1", "2", "Fizz", "4", "Buzz"], Game.FizzBuzz(5));
    [Test("15 is FizzBuzz")] public static void Fifteen() => Assert.Equal("FizzBuzz", Game.FizzBuzz(15)[14]);
    [Test("Returns exactly n items")] public static void Count() => Assert.Equal(100, Game.FizzBuzz(100).Count);
    [Test("n = 0 gives an empty list")] public static void Empty() => Assert.Equal(0, Game.FizzBuzz(0).Count);
    [Test("Negative n is rejected")] public static void Negative() => Assert.Throws<ArgumentException>(() => Game.FizzBuzz(-3));
}

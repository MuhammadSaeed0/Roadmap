public static class Lambdas
{
    // Returns a function that multiplies its argument by factor.
    public static Func<int, int> MakeMultiplier(int factor)
    {
        throw new NotImplementedException();
    }

    // Keeps the items for which keep(item) is true, in their original order.
    public static List<T> Where<T>(List<T> items, Func<T, bool> keep)
    {
        throw new NotImplementedException();
    }

    // Returns a function that runs first, then second on its result: second(first(x)).
    public static Func<int, int> Then(Func<int, int> first, Func<int, int> second)
    {
        throw new NotImplementedException();
    }
}

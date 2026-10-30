public static class Statistics
{
    public static double Average(IReadOnlyList<int> values)
    {
        if (values.Count == 0) throw new InvalidOperationException("Can't average an empty list.");
        var sum = 0;
        foreach (var v in values) sum += v;
        return (double)sum / values.Count;
    }

    public static int SumTo(int n)
    {
        var total = 0;
        for (var i = 1; i <= n; i++) total += i;
        return total;
    }
}

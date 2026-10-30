public static class Statistics
{
    public static double Average(IReadOnlyList<int> values)
    {
        var sum = 0;
        foreach (var v in values) sum += v;
        return sum / values.Count;
    }

    public static int SumTo(int n)
    {
        var total = 0;
        for (var i = 1; i < n; i++) total += i;
        return total;
    }
}

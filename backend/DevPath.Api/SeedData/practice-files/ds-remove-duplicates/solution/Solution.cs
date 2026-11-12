public static class Lists
{
    public static List<int> Unique(int[] numbers)
    {
        var seen = new HashSet<int>();
        var result = new List<int>();
        foreach (var n in numbers)
            if (seen.Add(n)) result.Add(n);
        return result;
    }
}

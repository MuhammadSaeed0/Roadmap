public static class Algo
{
    public static List<int> TopKFrequent(int[] numbers, int k) =>
        numbers.GroupBy(n => n)
            .OrderByDescending(g => g.Count()).ThenBy(g => g.Key)
            .Take(k).Select(g => g.Key).ToList();
}

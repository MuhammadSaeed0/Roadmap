public static class Algo
{
    public static int[] TwoSum(int[] numbers, int target)
    {
        var seen = new Dictionary<int, int>();
        for (var i = 0; i < numbers.Length; i++)
        {
            if (seen.TryGetValue(target - numbers[i], out var j)) return [j, i];
            seen.TryAdd(numbers[i], i);
        }
        return [];
    }
}

public static class Algo
{
    public static int MaxSubarraySum(int[] numbers)
    {
        int current = numbers[0], best = numbers[0];
        for (var i = 1; i < numbers.Length; i++)
        {
            current = Math.Max(numbers[i], current + numbers[i]);
            best = Math.Max(best, current);
        }
        return best;
    }
}

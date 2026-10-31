public static class Search
{
    public static int LastComparisons { get; private set; }

    public static int IndexOf(int[] sorted, int target)
    {
        LastComparisons = 0;
        int low = 0, high = sorted.Length - 1;
        while (low <= high)
        {
            var mid = low + (high - low) / 2;
            LastComparisons++;
            if (sorted[mid] == target) return mid;
            if (sorted[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}

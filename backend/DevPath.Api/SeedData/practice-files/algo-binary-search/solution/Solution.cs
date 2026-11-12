public static class Algo
{
    public static int BinarySearch(int[] sorted, int target)
    {
        int low = 0, high = sorted.Length - 1;
        while (low <= high)
        {
            var mid = low + (high - low) / 2;
            if (sorted[mid] == target) return mid;
            if (sorted[mid] < target) low = mid + 1; else high = mid - 1;
        }
        return -1;
    }
}

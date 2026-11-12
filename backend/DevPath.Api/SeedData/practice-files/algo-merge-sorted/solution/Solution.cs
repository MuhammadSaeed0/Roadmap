public static class Algo
{
    public static int[] Merge(int[] first, int[] second)
    {
        var result = new int[first.Length + second.Length];
        int i = 0, j = 0, k = 0;
        while (i < first.Length && j < second.Length) result[k++] = first[i] <= second[j] ? first[i++] : second[j++];
        while (i < first.Length) result[k++] = first[i++];
        while (j < second.Length) result[k++] = second[j++];
        return result;
    }
}

public static class Lists
{
    public static int[] Rotate(int[] numbers, int steps)
    {
        var result = new int[numbers.Length];
        for (var i = 0; i < numbers.Length; i++) result[(i + steps) % numbers.Length] = numbers[i];
        return result;
    }
}

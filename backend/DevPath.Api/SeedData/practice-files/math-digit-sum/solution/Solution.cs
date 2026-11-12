public static class Numbers
{
    public static int DigitSum(int number)
    {
        var sum = 0;
        for (; number > 0; number /= 10) sum += number % 10;
        return sum;
    }
}

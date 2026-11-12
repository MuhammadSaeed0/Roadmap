public static class Numbers
{
    public static long Fibonacci(int n)
    {
        long a = 0, b = 1;
        for (var i = 0; i < n; i++) (a, b) = (b, a + b);
        return a;
    }
}

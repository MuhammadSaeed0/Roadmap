public static class Numbers
{
    public static List<int> PrimesUpTo(int limit)
    {
        var primes = new List<int>();
        if (limit < 2) return primes;
        var composite = new bool[limit + 1];
        for (var n = 2; n <= limit; n++)
        {
            if (composite[n]) continue;
            primes.Add(n);
            for (long m = (long)n * n; m <= limit; m += n) composite[m] = true;
        }
        return primes;
    }
}

public static class Numbers
{
    public static bool IsPrime(int number)
    {
        if (number < 2) return false;
        for (long i = 2; i * i <= number; i++)
            if (number % i == 0) return false;
        return true;
    }
}

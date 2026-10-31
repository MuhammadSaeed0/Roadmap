public static class Game
{
    public static List<string> FizzBuzz(int n)
    {
        if (n < 0) throw new ArgumentException("n can't be negative.", nameof(n));
        var result = new List<string>(n);
        for (var i = 1; i <= n; i++)
        {
            if (i % 15 == 0) result.Add("FizzBuzz");
            else if (i % 3 == 0) result.Add("Fizz");
            else if (i % 5 == 0) result.Add("Buzz");
            else result.Add(i.ToString());
        }
        return result;
    }
}

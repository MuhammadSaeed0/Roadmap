public static class Algo
{
    public static List<string> FizzBuzz(int n)
    {
        var result = new List<string>();
        for (var i = 1; i <= n; i++)
            result.Add(i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : i.ToString());
        return result;
    }
}

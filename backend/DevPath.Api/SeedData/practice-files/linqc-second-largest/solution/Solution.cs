public static class Queries
{
    public static int? SecondLargest(int[] numbers) =>
        numbers.Distinct().OrderByDescending(n => n).Skip(1).Select(n => (int?)n).FirstOrDefault();
}

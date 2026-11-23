public struct Point
{
    public int X;
    public int Y;
}

public class Marker
{
    public int X;
    public int Y;
}

public static class Moves
{
    // Moves every point in the array to X = 0. (Points are structs: copies!)
    public static void ResetX(Point[] points)
    {
        foreach (var p in points)
        {
            var copy = p;
            copy.X = 0;
        }
    }

    // Returns a NEW list with the same numbers: changing one list must not change the other.
    public static List<int> CopyOf(List<int> numbers) => numbers;

    // Swaps the values of two variables of the caller.
    public static void Swap(ref int a, ref int b)
    {
        var temp = a;
        a = b;
        b = a;
    }
}

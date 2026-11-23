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
    public static void ResetX(Point[] points)
    {
        // foreach gives a copy of each struct; index into the array to change the stored value.
        for (var i = 0; i < points.Length; i++) points[i].X = 0;
    }

    public static List<int> CopyOf(List<int> numbers) => new(numbers);

    public static void Swap(ref int a, ref int b) => (a, b) = (b, a);
}

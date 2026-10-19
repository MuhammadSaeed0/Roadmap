public struct PointStruct { public int X; }
public class PointClass { public int X; }

var s1 = new PointStruct { X = 1 };
var s2 = s1;      // copy of the value
s2.X = 99;
Console.WriteLine(s1.X);   // 1

var c1 = new PointClass { X = 1 };
var c2 = c1;      // copy of the reference — same object
c2.X = 99;
Console.WriteLine(c1.X);   // 99

void Clear(List<int> list) => list.Clear();   // affects the caller's list

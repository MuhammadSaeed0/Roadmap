int a = 7, b = 2;
Console.WriteLine(a / b);          // 3   (integer division)
Console.WriteLine(a / (double)b);  // 3.5
Console.WriteLine(a % b);          // 1   (remainder)

string? nickname = null;
string display = nickname ?? "Guest";      // like COALESCE(nickname, 'Guest')
int? length = nickname?.Length;            // null instead of NullReferenceException

bool lowStock = stock < 10 && isActive;    // right side only runs if needed

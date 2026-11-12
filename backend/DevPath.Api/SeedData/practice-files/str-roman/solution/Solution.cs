public static class Text
{
    public static string ToRoman(int number)
    {
        (int Value, string Symbol)[] table =
        [
            (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
            (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
        ];
        var result = new System.Text.StringBuilder();
        foreach (var (value, symbol) in table)
            while (number >= value) { result.Append(symbol); number -= value; }
        return result.ToString();
    }
}

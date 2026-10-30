public class InvalidAgeException(string input)
    : Exception($"'{input}' is not a valid age (0–130).")
{
    public string Input { get; } = input;
}

public static class AgeParser
{
    public static int Parse(string text) =>
        Validate(text, out var age) ? age : throw new InvalidAgeException(text);

    public static bool TryParse(string text, out int age) => Validate(text, out age);

    private static bool Validate(string? text, out int age) =>
        int.TryParse(text?.Trim(), out age) && age is >= 0 and <= 130;
}

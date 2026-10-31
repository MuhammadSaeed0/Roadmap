public static class Tests
{
    [Test("Precedence: * before +")] public static void Precedence() => Assert.Equal(14m, Calculator.Evaluate("2 + 3 * 4"));
    [Test("Parentheses")] public static void Parens() => Assert.Equal(20m, Calculator.Evaluate("(2 + 3) * 4"));
    [Test("Unary minus and decimals")] public static void Unary() => Assert.Equal(-0.5m, Calculator.Evaluate("-3 + 10 / 4"));
    [Test("Left to right for - and /")] public static void Assoc() { Assert.Equal(3m, Calculator.Evaluate("10 - 4 - 3")); Assert.Equal(2m, Calculator.Evaluate("16 / 4 / 2")); }
    [Test("Nested parentheses and spaces")] public static void Nested() => Assert.Equal(-9m, Calculator.Evaluate(" -( (1 + 2) * 3 ) "));
    [Test("Unbalanced parentheses are rejected")] public static void Unbalanced() { Assert.Throws<FormatException>(() => Calculator.Evaluate("2 * (3")); Assert.Throws<FormatException>(() => Calculator.Evaluate("2 * 3)")); }
    [Test("Unknown characters and missing numbers are rejected")] public static void Invalid() { Assert.Throws<FormatException>(() => Calculator.Evaluate("2 $ 3")); Assert.Throws<FormatException>(() => Calculator.Evaluate("4 +")); }
    [Test("Division by zero")] public static void DivZero() => Assert.Throws<DivideByZeroException>(() => Calculator.Evaluate("1 / (2 - 2)"));
}

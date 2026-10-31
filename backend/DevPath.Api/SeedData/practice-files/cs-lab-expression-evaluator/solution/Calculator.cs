using System.Globalization;

public static class Calculator
{
    public static decimal Evaluate(string expression)
    {
        var parser = new Parser(expression);
        var value = parser.Expression();
        parser.SkipSpaces();
        if (!parser.AtEnd) throw new FormatException($"Unexpected '{parser.Current}' at position {parser.Position + 1}.");
        return value;
    }

    private sealed class Parser(string text)
    {
        public int Position { get; private set; }
        public bool AtEnd => Position >= text.Length;
        public char Current => text[Position];

        public void SkipSpaces() { while (!AtEnd && char.IsWhiteSpace(Current)) Position++; }

        private bool Accept(char c)
        {
            SkipSpaces();
            if (AtEnd || Current != c) return false;
            Position++;
            return true;
        }

        public decimal Expression()
        {
            var value = Term();
            while (true)
            {
                if (Accept('+')) value += Term();
                else if (Accept('-')) value -= Term();
                else return value;
            }
        }

        private decimal Term()
        {
            var value = Factor();
            while (true)
            {
                if (Accept('*')) value *= Factor();
                else if (Accept('/'))
                {
                    var divisor = Factor();
                    if (divisor == 0) throw new DivideByZeroException("Division by zero.");
                    value /= divisor;
                }
                else return value;
            }
        }

        private decimal Factor()
        {
            if (Accept('-')) return -Factor();
            if (Accept('('))
            {
                var inner = Expression();
                if (!Accept(')')) throw new FormatException("Missing ')'.");
                return inner;
            }
            SkipSpaces();
            var start = Position;
            while (!AtEnd && (char.IsDigit(Current) || Current == '.')) Position++;
            if (start == Position) throw new FormatException(AtEnd ? "Expected a number at the end." : $"Expected a number at position {Position + 1}.");
            return decimal.Parse(text[start..Position], CultureInfo.InvariantCulture);
        }
    }
}

public static class Algo
{
    public static bool IsBalanced(string text)
    {
        var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
        var stack = new Stack<char>();
        foreach (var c in text)
        {
            if (c is '(' or '[' or '{') stack.Push(c);
            else if (pairs.TryGetValue(c, out var open) && (stack.Count == 0 || stack.Pop() != open)) return false;
        }
        return stack.Count == 0;
    }
}

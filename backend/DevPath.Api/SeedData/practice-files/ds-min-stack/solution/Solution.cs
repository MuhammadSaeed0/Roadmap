public class MinStack
{
    private readonly Stack<(int Value, int Min)> _items = new();

    public int Top => Peek().Value;
    public int Min => Peek().Min;

    public void Push(int value) => _items.Push((value, _items.Count == 0 ? value : Math.Min(value, _items.Peek().Min)));

    public int Pop()
    {
        Peek();
        return _items.Pop().Value;
    }

    private (int Value, int Min) Peek() =>
        _items.Count == 0 ? throw new InvalidOperationException("The stack is empty.") : _items.Peek();
}

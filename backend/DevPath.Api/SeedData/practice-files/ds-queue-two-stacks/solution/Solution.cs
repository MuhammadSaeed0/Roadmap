public class TwoStackQueue<T>
{
    private readonly Stack<T> _in = new();
    private readonly Stack<T> _out = new();

    public int Count => _in.Count + _out.Count;

    public void Enqueue(T item) => _in.Push(item);

    public T Dequeue()
    {
        if (_out.Count == 0)
            while (_in.Count > 0) _out.Push(_in.Pop());
        if (_out.Count == 0) throw new InvalidOperationException("The queue is empty.");
        return _out.Pop();
    }
}

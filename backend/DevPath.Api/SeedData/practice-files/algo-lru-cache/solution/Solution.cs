public class LruCache(int capacity)
{
    private readonly Dictionary<int, LinkedListNode<(int Key, int Value)>> _nodes = new();
    private readonly LinkedList<(int Key, int Value)> _order = new();

    public int Get(int key)
    {
        if (!_nodes.TryGetValue(key, out var node)) return -1;
        _order.Remove(node);
        _order.AddFirst(node);
        return node.Value.Value;
    }

    public void Put(int key, int value)
    {
        if (_nodes.TryGetValue(key, out var existing)) _order.Remove(existing);
        _nodes[key] = _order.AddFirst((key, value));
        if (_nodes.Count > capacity)
        {
            var last = _order.Last!;
            _order.RemoveLast();
            _nodes.Remove(last.Value.Key);
        }
    }
}

public class PriceTicker
{
    private readonly List<Action<decimal>> _subscribers = [];

    public decimal? LastPrice { get; private set; }

    public IDisposable Subscribe(Action<decimal> onPrice)
    {
        _subscribers.Add(onPrice);
        return new Subscription(() => _subscribers.Remove(onPrice));
    }

    public void Publish(decimal price)
    {
        if (LastPrice == price) return;
        LastPrice = price;
        // A copy, so a handler may unsubscribe while we notify.
        foreach (var subscriber in _subscribers.ToList()) subscriber(price);
    }

    private sealed class Subscription(Action unsubscribe) : IDisposable
    {
        private Action? _unsubscribe = unsubscribe;

        public void Dispose()
        {
            _unsubscribe?.Invoke();
            _unsubscribe = null;
        }
    }
}

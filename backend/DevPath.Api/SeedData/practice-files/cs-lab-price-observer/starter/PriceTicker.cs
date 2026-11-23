// Observer pattern: subscribers are told about every new price until they unsubscribe.
public class PriceTicker
{
    public decimal? LastPrice { get; private set; }

    // Registers a handler. Disposing the returned object unsubscribes it.
    public IDisposable Subscribe(Action<decimal> onPrice)
    {
        throw new NotImplementedException();
    }

    // Stores the price and notifies every current subscriber, in subscription order.
    // Publishing the same price twice in a row notifies nobody the second time.
    public void Publish(decimal price)
    {
        throw new NotImplementedException();
    }
}

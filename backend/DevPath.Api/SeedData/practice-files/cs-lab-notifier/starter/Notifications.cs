public interface IChannel
{
    // Sends the message and returns what was actually delivered, e.g. "email: Hello".
    string Send(string message);
}

public class EmailChannel : IChannel
{
    public string Send(string message) => throw new NotImplementedException();
}

// An SMS carries at most 20 characters: longer messages are cut to 17 characters plus "...".
public class SmsChannel : IChannel
{
    public string Send(string message) => throw new NotImplementedException();
}

// The notifier HAS channels (composition) instead of inheriting from one of them.
public class Notifier
{
    public Notifier(IEnumerable<IChannel> channels)
    {
    }

    public List<string> Notify(string message) => throw new NotImplementedException();
}

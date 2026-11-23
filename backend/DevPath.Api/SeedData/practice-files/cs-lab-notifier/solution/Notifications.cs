public interface IChannel
{
    string Send(string message);
}

public class EmailChannel : IChannel
{
    public string Send(string message) => "email: " + message;
}

public class SmsChannel : IChannel
{
    public string Send(string message) => "sms: " + (message.Length <= 20 ? message : message[..17] + "...");
}

public class Notifier
{
    private readonly List<IChannel> _channels;

    public Notifier(IEnumerable<IChannel> channels) => _channels = channels.ToList();

    public List<string> Notify(string message) => _channels.Select(c => c.Send(message)).ToList();
}

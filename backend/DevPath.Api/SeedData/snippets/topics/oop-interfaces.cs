public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body);
}

public class SmtpEmailSender : IEmailSender
{
    public Task SendAsync(string to, string subject, string body)
    {
        // real SMTP code
        return Task.CompletedTask;
    }
}

// In tests: a fake that records what was sent
public class FakeEmailSender : IEmailSender
{
    public List<string> Sent { get; } = [];
    public Task SendAsync(string to, string subject, string body)
    {
        Sent.Add(to);
        return Task.CompletedTask;
    }
}

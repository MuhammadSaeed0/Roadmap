public static class Tests
{
    private sealed class FakeChannel : IChannel
    {
        public List<string> Sent { get; } = [];
        public string Send(string message) { Sent.Add(message); return "fake: " + message; }
    }

    [Test("Email delivers the whole message")]
    public static void Email() => Assert.Equal("email: Your order shipped", new EmailChannel().Send("Your order shipped"));

    [Test("SMS cuts long messages to 20 characters")]
    public static void Sms()
    {
        Assert.Equal("sms: Short", new SmsChannel().Send("Short"));
        Assert.Equal("sms: Your order has sh...", new SmsChannel().Send("Your order has shipped today"));
    }

    [Test("The notifier sends through every channel, in order")]
    public static void AllChannels() =>
        Assert.SequenceEqual(new[] { "email: Hi", "sms: Hi" }, new Notifier([new EmailChannel(), new SmsChannel()]).Notify("Hi"));

    [Test("Any IChannel can be plugged in, such as a fake in a test")]
    public static void Pluggable()
    {
        var fake = new FakeChannel();
        var delivered = new Notifier([fake]).Notify("Ping");
        Assert.SequenceEqual(new[] { "Ping" }, fake.Sent);
        Assert.SequenceEqual(new[] { "fake: Ping" }, delivered);
    }
}

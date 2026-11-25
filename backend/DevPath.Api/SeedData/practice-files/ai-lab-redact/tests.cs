public static class Tests
{
    [Test("Emails become [email]")]
    public static void Emails() =>
        Assert.Equal("Write to [email] today.", Redactor.Mask("Write to sara.ali@example.com today."));

    [Test("Phone numbers with spaces, dashes or + become [phone]")]
    public static void Phones()
    {
        Assert.Equal("Call [phone] now", Redactor.Mask("Call 0100 123 4567 now"));
        Assert.Equal("Call [phone] now", Redactor.Mask("Call +20-100-123-4567 now"));
    }

    [Test("Short numbers such as order ids stay")]
    public static void KeepsShortNumbers() =>
        Assert.Equal("Order 42 shipped on 2026-11-25", Redactor.Mask("Order 42 shipped on 2026-11-25"));

    [Test("Several items in one text are all masked")]
    public static void Several() =>
        Assert.Equal("[email] or [email], [phone]", Redactor.Mask("a@b.co or c.d@e.org, 01001234567"));
}

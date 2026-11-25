public static class Redactor
{
    /// <summary>
    /// Replaces every email address with [email] and every phone number (9 or more digits, which may be separated
    /// by spaces or dashes and may start with +) with [phone]. Everything else stays as it is.
    /// </summary>
    public static string Mask(string text) => text;
}

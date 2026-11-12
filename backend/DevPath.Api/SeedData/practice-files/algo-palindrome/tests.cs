public static class Tests
{
    [Test("A sentence with punctuation")]
    public static void T1()
    {
        Assert.True(Algo.IsPalindrome("A man, a plan, a canal: Panama"), "A sentence with punctuation");
    }

    [Test("Not a palindrome")]
    public static void T2()
    {
        Assert.False(Algo.IsPalindrome("race a car"), "Not a palindrome");
    }

    [Test("Empty text is a palindrome")]
    public static void T3()
    {
        Assert.True(Algo.IsPalindrome(""), "Empty text is a palindrome");
    }

    [Test("Only punctuation is a palindrome")]
    public static void T4()
    {
        Assert.True(Algo.IsPalindrome(".,!"), "Only punctuation is a palindrome");
    }

    [Test("Digits count")]
    public static void T5()
    {
        Assert.False(Algo.IsPalindrome("1a2"), "Digits count");
    }
}

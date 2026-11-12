public static class Tests
{
    [Test("Simple anagram")]
    public static void T1()
    {
        Assert.True(Algo.AreAnagrams("listen", "silent"), "Simple anagram");
    }

    [Test("Ignores case and spaces")]
    public static void T2()
    {
        Assert.True(Algo.AreAnagrams("Dormitory", "dirty room"), "Ignores case and spaces");
    }

    [Test("Different letter counts")]
    public static void T3()
    {
        Assert.False(Algo.AreAnagrams("aab", "abb"), "Different letter counts");
    }

    [Test("Different lengths")]
    public static void T4()
    {
        Assert.False(Algo.AreAnagrams("abc", "abcd"), "Different lengths");
    }

    [Test("Two empty texts")]
    public static void T5()
    {
        Assert.True(Algo.AreAnagrams("", ""), "Two empty texts");
    }
}

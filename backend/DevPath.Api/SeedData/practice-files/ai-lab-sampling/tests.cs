public static class Tests
{
    [Test("Softmax returns probabilities that add up to 1")]
    public static void SumsToOne()
    {
        var p = Sampling.Softmax([2.0, 1.0, 0.0], 1.0);
        Assert.True(Math.Abs(p.Sum() - 1.0) < 1e-9, "the probabilities should add up to 1");
        Assert.True(Math.Abs(p[0] - 0.665) < 0.001, "at temperature 1 the first token has about 0.665");
    }

    [Test("A lower temperature makes the top token more likely")]
    public static void TemperatureSharpens()
    {
        var steady = Sampling.Softmax([2.0, 1.0, 0.0], 0.5);
        var varied = Sampling.Softmax([2.0, 1.0, 0.0], 2.0);
        Assert.True(steady[0] > 0.86 && steady[0] < 0.87, "at 0.5 the first token has about 0.867");
        Assert.True(varied[0] > 0.50 && varied[0] < 0.51, "at 2 the first token has about 0.506");
    }

    [Test("Softmax survives very large scores")]
    public static void Stable()
    {
        var p = Sampling.Softmax([1000.0, 999.0], 1.0);
        Assert.False(double.IsNaN(p[0]), "subtract the largest score before Math.Exp");
        Assert.True(p[0] > 0.73 && p[0] < 0.74, "the first of two scores 1 apart has about 0.731");
    }

    [Test("Greedy picks the most likely token")]
    public static void PicksTop() => Assert.Equal(2, Sampling.Greedy([0.1, 0.3, 0.6]));

    [Test("Top-p keeps the most likely tokens until they reach p")]
    public static void Nucleus()
    {
        Assert.SequenceEqual(new[] { 0, 1, 2 }, Sampling.TopP([0.50, 0.25, 0.15, 0.06, 0.04], 0.85));
        Assert.SequenceEqual(new[] { 2 }, Sampling.TopP([0.1, 0.2, 0.7], 0.5));
    }
}

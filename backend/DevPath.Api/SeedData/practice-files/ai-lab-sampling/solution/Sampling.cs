public static class Sampling
{
    /// <summary>Divide each score by the temperature, then softmax: probabilities that add up to 1.</summary>
    public static double[] Softmax(double[] scores, double temperature)
    {
        var scaled = scores.Select(s => s / temperature).ToArray();
        var max = scaled.Max();                         // subtract the max so Math.Exp never overflows
        var exps = scaled.Select(s => Math.Exp(s - max)).ToArray();
        var sum = exps.Sum();
        return exps.Select(e => e / sum).ToArray();
    }

    /// <summary>The index of the highest probability (what a temperature close to 0 picks).</summary>
    public static int Greedy(double[] probabilities) => Array.IndexOf(probabilities, probabilities.Max());

    /// <summary>
    /// Top-p: the indexes of the most likely tokens, highest first, stopping as soon as their probabilities add up
    /// to at least p.
    /// </summary>
    public static List<int> TopP(double[] probabilities, double p)
    {
        var kept = new List<int>();
        double total = 0;
        foreach (var i in Enumerable.Range(0, probabilities.Length).OrderByDescending(i => probabilities[i]))
        {
            kept.Add(i);
            total += probabilities[i];
            if (total >= p) break;
        }
        return kept;
    }
}

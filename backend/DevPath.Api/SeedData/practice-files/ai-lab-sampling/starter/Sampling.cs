public static class Sampling
{
    /// <summary>Divide each score by the temperature, then softmax: probabilities that add up to 1.</summary>
    public static double[] Softmax(double[] scores, double temperature) => new double[scores.Length];

    /// <summary>The index of the highest probability (what a temperature close to 0 picks).</summary>
    public static int Greedy(double[] probabilities) => -1;

    /// <summary>
    /// Top-p: the indexes of the most likely tokens, highest first, stopping as soon as their probabilities add up
    /// to at least p.
    /// </summary>
    public static List<int> TopP(double[] probabilities, double p) => [];
}

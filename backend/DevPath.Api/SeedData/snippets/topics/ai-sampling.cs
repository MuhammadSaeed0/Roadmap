// Temperature reshapes the model's scores before they become probabilities.
static double[] Softmax(double[] scores, double temperature)
{
    var scaled = scores.Select(s => s / temperature).ToArray();
    var max = scaled.Max();                                  // for numerical stability
    var exps = scaled.Select(s => Math.Exp(s - max)).ToArray();
    var sum = exps.Sum();
    return exps.Select(e => e / sum).ToArray();
}

double[] scores = [2.0, 1.0, 0.0];
foreach (var t in new[] { 0.5, 1.0, 2.0 })
    Console.WriteLine($"T={t}: {string.Join(", ", Softmax(scores, t).Select(p => p.ToString("0.00")))}");
// T=0.5: 0.87, 0.12, 0.02   (steady: the top token almost always wins)
// T=1:   0.67, 0.24, 0.09
// T=2:   0.51, 0.31, 0.19   (varied: other tokens get a real chance)

// For extraction and classification, keep it steady:
var options = new ChatOptions { Temperature = 0f };

public static class Grades
{
    public static string Letter(int score)
    {
        if (score is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "A score must be between 0 and 100.");
        return score switch
        {
            >= 90 => "A",
            >= 80 => "B",
            >= 70 => "C",
            >= 60 => "D",
            _ => "F",
        };
    }
}

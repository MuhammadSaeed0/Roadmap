public static class Lists
{
    public static int[][] Transpose(int[][] matrix)
    {
        var result = new int[matrix[0].Length][];
        for (var c = 0; c < result.Length; c++)
        {
            result[c] = new int[matrix.Length];
            for (var r = 0; r < matrix.Length; r++) result[c][r] = matrix[r][c];
        }
        return result;
    }
}

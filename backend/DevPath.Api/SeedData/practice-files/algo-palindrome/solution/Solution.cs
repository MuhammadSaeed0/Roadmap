public static class Algo
{
    public static bool IsPalindrome(string text)
    {
        int left = 0, right = text.Length - 1;
        while (left < right)
        {
            if (!char.IsLetterOrDigit(text[left])) { left++; continue; }
            if (!char.IsLetterOrDigit(text[right])) { right--; continue; }
            if (char.ToLowerInvariant(text[left]) != char.ToLowerInvariant(text[right])) return false;
            left++; right--;
        }
        return true;
    }
}

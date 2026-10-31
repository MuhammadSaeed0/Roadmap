namespace Library;

public class Book(string isbn, string title, int copies)
{
    public string Isbn { get; } = isbn;
    public string Title { get; } = title;
    public int Copies { get; } = copies;
}

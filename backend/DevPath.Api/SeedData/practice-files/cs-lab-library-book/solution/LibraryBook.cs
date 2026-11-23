public class LibraryBook
{
    private readonly int _totalCopies;

    public LibraryBook(string title, int copies)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("A book needs a title.", nameof(title));
        if (copies < 1) throw new ArgumentOutOfRangeException(nameof(copies), "A book needs at least one copy.");
        Title = title;
        _totalCopies = copies;
        AvailableCopies = copies;
    }

    public string Title { get; }
    public int AvailableCopies { get; private set; }
    public bool IsAvailable => AvailableCopies > 0;

    public void Borrow()
    {
        if (!IsAvailable) throw new InvalidOperationException($"No copies of {Title} are left.");
        AvailableCopies--;
    }

    public void Return()
    {
        if (AvailableCopies == _totalCopies) throw new InvalidOperationException("All copies are already on the shelf.");
        AvailableCopies++;
    }
}

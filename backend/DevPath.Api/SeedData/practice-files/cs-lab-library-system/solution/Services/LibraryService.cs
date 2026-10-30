namespace Library;

public class LibraryService
{
    private readonly Dictionary<string, Book> _books = [];
    private readonly Dictionary<int, Member> _members = [];
    private readonly List<Loan> _loans = [];

    public void AddBook(Book book) => _books.Add(book.Isbn, book);
    public void AddMember(Member member) => _members.Add(member.Id, member);

    public int AvailableCopies(string isbn) => FindBook(isbn).Copies - _loans.Count(l => l.IsOpen && l.Book.Isbn == isbn);

    public void Borrow(int memberId, string isbn, DateOnly today)
    {
        var member = FindMember(memberId);
        var book = FindBook(isbn);
        var open = _loans.Where(l => l.IsOpen && l.Member.Id == memberId).ToList();
        if (open.Any(l => l.Book.Isbn == isbn)) throw new InvalidOperationException($"{member.Name} already has '{book.Title}'.");
        if (open.Count >= member.MaxLoans) throw new InvalidOperationException($"{member.Name} can borrow at most {member.MaxLoans} books.");
        if (AvailableCopies(isbn) == 0) throw new InvalidOperationException($"No copies of '{book.Title}' are available.");
        _loans.Add(new Loan(member, book, today));
    }

    public decimal Return(int memberId, string isbn, DateOnly today)
    {
        var loan = _loans.FirstOrDefault(l => l.IsOpen && l.Member.Id == memberId && l.Book.Isbn == isbn)
            ?? throw new InvalidOperationException("There is no open loan for this book and member.");
        return loan.Close(today);
    }

    private Book FindBook(string isbn) => _books.TryGetValue(isbn, out var b) ? b : throw new KeyNotFoundException($"Unknown book {isbn}.");
    private Member FindMember(int id) => _members.TryGetValue(id, out var m) ? m : throw new KeyNotFoundException($"Unknown member {id}.");
}

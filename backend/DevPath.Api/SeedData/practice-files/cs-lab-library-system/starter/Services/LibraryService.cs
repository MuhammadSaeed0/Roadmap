namespace Library;

public class LibraryService
{
    public void AddBook(Book book) => throw new NotImplementedException();
    public void AddMember(Member member) => throw new NotImplementedException();
    public int AvailableCopies(string isbn) => throw new NotImplementedException();
    public void Borrow(int memberId, string isbn, DateOnly today) => throw new NotImplementedException();
    public decimal Return(int memberId, string isbn, DateOnly today) => throw new NotImplementedException();
}

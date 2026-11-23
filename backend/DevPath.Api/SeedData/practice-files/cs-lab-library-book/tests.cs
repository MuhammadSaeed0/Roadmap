public static class Tests
{
    [Test("A new book has all its copies available")]
    public static void NewBook()
    {
        var book = new LibraryBook("Clean Code", 2);
        Assert.Equal("Clean Code", book.Title);
        Assert.Equal(2, book.AvailableCopies);
        Assert.True(book.IsAvailable, "a new book should be available");
    }

    [Test("Borrowing and returning change the available copies")]
    public static void BorrowReturn()
    {
        var book = new LibraryBook("Refactoring", 2);
        book.Borrow();
        book.Borrow();
        Assert.Equal(0, book.AvailableCopies);
        Assert.False(book.IsAvailable, "no copies are left");
        book.Return();
        Assert.Equal(1, book.AvailableCopies);
    }

    [Test("Borrowing with no copies left throws InvalidOperationException")]
    public static void BorrowTooMany()
    {
        var book = new LibraryBook("DDD", 1);
        book.Borrow();
        Assert.Throws<InvalidOperationException>(() => book.Borrow());
    }

    [Test("Returning more copies than the library owns throws")]
    public static void ReturnTooMany() =>
        Assert.Throws<InvalidOperationException>(() => new LibraryBook("DDD", 1).Return());

    [Test("The constructor rejects an empty title and zero copies")]
    public static void Validation()
    {
        Assert.Throws<ArgumentException>(() => new LibraryBook(" ", 1));
        Assert.Throws<ArgumentOutOfRangeException>(() => new LibraryBook("C#", 0));
    }
}

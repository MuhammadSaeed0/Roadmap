using Library;

public static class Tests
{
    private static readonly DateOnly Day1 = new(2026, 1, 1);

    private static LibraryService Setup()
    {
        var lib = new LibraryService();
        for (var i = 1; i <= 5; i++) lib.AddBook(new Book($"B{i}", $"Book {i}", i == 5 ? 1 : 2));
        lib.AddMember(new Member(1, "Student", MemberType.Student));
        lib.AddMember(new Member(2, "Staff", MemberType.Staff));
        return lib;
    }

    [Test("Borrowing takes a copy off the shelf")] public static void Copies() { var l = Setup(); l.Borrow(1, "B1", Day1); Assert.Equal(1, l.AvailableCopies("B1")); }
    [Test("A student can borrow 3 books, not 4")]
    public static void StudentLimit()
    {
        var l = Setup(); l.Borrow(1, "B1", Day1); l.Borrow(1, "B2", Day1); l.Borrow(1, "B3", Day1);
        Assert.Throws<InvalidOperationException>(() => l.Borrow(1, "B4", Day1));
    }
    [Test("Staff can borrow 5")] public static void StaffLimit() { var l = Setup(); for (var i = 1; i <= 5; i++) l.Borrow(2, $"B{i}", Day1); Assert.Equal(0, l.AvailableCopies("B5")); }
    [Test("No copies left")] public static void NoCopies() { var l = Setup(); l.Borrow(1, "B5", Day1); Assert.Throws<InvalidOperationException>(() => l.Borrow(2, "B5", Day1)); }
    [Test("Can't borrow the same book twice")] public static void Twice() { var l = Setup(); l.Borrow(1, "B1", Day1); Assert.Throws<InvalidOperationException>(() => l.Borrow(1, "B1", Day1)); }
    [Test("Unknown member or book")] public static void Unknown() { var l = Setup(); Assert.Throws<KeyNotFoundException>(() => l.Borrow(9, "B1", Day1)); Assert.Throws<KeyNotFoundException>(() => l.Borrow(1, "X", Day1)); }
    [Test("On-time return is free and frees the copy")] public static void OnTime() { var l = Setup(); l.Borrow(1, "B1", Day1); Assert.Equal(0m, l.Return(1, "B1", Day1.AddDays(14))); Assert.Equal(2, l.AvailableCopies("B1")); }
    [Test("5 days late costs 7.50, capped at 30")]
    public static void Fees()
    {
        var l = Setup(); l.Borrow(1, "B1", Day1); l.Borrow(1, "B2", Day1);
        Assert.Equal(7.50m, l.Return(1, "B1", Day1.AddDays(19)));
        Assert.Equal(30m, l.Return(1, "B2", Day1.AddDays(100)));
    }
}

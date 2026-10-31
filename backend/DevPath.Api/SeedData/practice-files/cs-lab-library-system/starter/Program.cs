using Library;

var library = new LibraryService();
library.AddBook(new Book("978-1", "Clean Code", 2));
library.AddMember(new Member(1, "Sara", MemberType.Student));
library.Borrow(1, "978-1", new DateOnly(2026, 1, 1));
Console.WriteLine($"Copies left: {library.AvailableCopies("978-1")}");
Console.WriteLine($"Fee: {library.Return(1, "978-1", new DateOnly(2026, 1, 20))}");

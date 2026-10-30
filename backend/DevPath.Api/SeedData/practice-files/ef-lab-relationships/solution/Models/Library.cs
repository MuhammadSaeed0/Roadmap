public class Author
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Book> Books { get; set; } = [];
}

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Isbn { get; set; } = "";
    public decimal Price { get; set; }
    public int AuthorId { get; set; }
    public Author Author { get; set; } = null!;
    public List<Tag> Tags { get; set; } = [];
    public BookCover? Cover { get; set; }
}

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Book> Books { get; set; } = [];
}

public class BookCover
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = "";
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
}

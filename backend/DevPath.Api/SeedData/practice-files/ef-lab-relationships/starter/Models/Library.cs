public class Author
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    // TODO: books
}

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Isbn { get; set; } = "";
    public decimal Price { get; set; }
    // TODO: author, tags, cover
}

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class BookCover
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = "";
}

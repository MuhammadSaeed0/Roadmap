using Microsoft.EntityFrameworkCore;

public class LibraryContext(DbContextOptions<LibraryContext> options) : DbContext(options)
{
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Author>(a =>
        {
            a.Property(x => x.Name).HasMaxLength(150).IsRequired();
            a.HasMany(x => x.Books).WithOne(b => b.Author).HasForeignKey(b => b.AuthorId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Book>(b =>
        {
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
            b.Property(x => x.Isbn).HasMaxLength(17).IsRequired();
            b.Property(x => x.Price).HasPrecision(10, 2);
            b.HasIndex(x => x.Isbn).IsUnique();
            b.HasMany(x => x.Tags).WithMany(t => t.Books);
            b.HasOne(x => x.Cover).WithOne(c => c.Book).HasForeignKey<BookCover>(c => c.BookId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Tag>(t =>
        {
            t.Property(x => x.Name).HasMaxLength(50).IsRequired();
            t.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<BookCover>().Property(x => x.ImageUrl).HasMaxLength(500).IsRequired();
    }
}

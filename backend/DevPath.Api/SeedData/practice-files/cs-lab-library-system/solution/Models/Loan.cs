namespace Library;

public class Loan(Member member, Book book, DateOnly borrowedOn)
{
    public const int Days = 14;
    public const decimal FeePerDay = 1.50m;
    public const decimal MaxFee = 30m;

    public Member Member { get; } = member;
    public Book Book { get; } = book;
    public DateOnly DueDate { get; } = borrowedOn.AddDays(Days);
    public DateOnly? ReturnedOn { get; private set; }
    public bool IsOpen => ReturnedOn is null;

    public decimal Close(DateOnly returnedOn)
    {
        ReturnedOn = returnedOn;
        var lateDays = returnedOn.DayNumber - DueDate.DayNumber;
        return lateDays <= 0 ? 0 : Math.Min(MaxFee, lateDays * FeePerDay);
    }
}

public interface IClock
{
    DateTime Now { get; }
}

public class SystemClock : IClock
{
    public DateTime Now => DateTime.Now;
}

public interface IDiscountRules
{
    int PercentFor(DateTime day);
}

public class WeekendDiscount : IDiscountRules
{
    public int PercentFor(DateTime day) => day.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday ? 10 : 0;
}

public class PriceService(IClock clock, IDiscountRules rules)
{
    public decimal FinalPrice(decimal price)
    {
        var percent = rules.PercentFor(clock.Now);
        return Math.Round(price - price * percent / 100m, 2);
    }
}

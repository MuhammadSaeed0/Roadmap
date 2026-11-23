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
    // The discount in percent for a given day, e.g. 10 for 10 %.
    int PercentFor(DateTime day);
}

public class WeekendDiscount : IDiscountRules
{
    public int PercentFor(DateTime day) => day.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday ? 10 : 0;
}

// TODO: receive IClock and IDiscountRules through the constructor and use them.
// The class must not create its own dependencies with new or read DateTime.Now.
public class PriceService
{
    public PriceService(IClock clock, IDiscountRules rules)
    {
    }

    public decimal FinalPrice(decimal price)
    {
        var rules = new WeekendDiscount();
        var percent = rules.PercentFor(DateTime.Now);
        return price - price * percent / 100m;
    }
}

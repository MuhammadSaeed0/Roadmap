public record Purchase(string Customer, decimal Amount);

public static class Reports
{
    public static List<string> TopCustomers(List<Purchase> purchases, int count)
    {
        // TODO
        return [];
    }
}

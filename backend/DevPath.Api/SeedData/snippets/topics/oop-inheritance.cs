public abstract class Employee(string name)
{
    public string Name { get; } = name;
    public abstract decimal CalculatePay();
    public virtual string Describe() => $"{Name}: {CalculatePay():C}";
}

public class SalariedEmployee(string name, decimal monthly) : Employee(name)
{
    public override decimal CalculatePay() => monthly;
}

public sealed class HourlyEmployee(string name, decimal rate, int hours) : Employee(name)
{
    public override decimal CalculatePay() => rate * hours;
    public override string Describe() => base.Describe() + $" ({hours}h)";
}

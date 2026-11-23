public abstract class Employee(string name)
{
    public string Name { get; } = name;

    // TODO: make MonthlyPay overridable and use it in Describe.
    public decimal MonthlyPay() => 0;

    public string Describe() => $"{Name}: 0";
}

public class SalariedEmployee(string name, decimal salary) : Employee(name)
{
    public decimal Salary { get; } = salary;
}

public class Manager(string name, decimal salary, decimal bonus) : SalariedEmployee(name, salary)
{
    public decimal Bonus { get; } = bonus;
}

public class Contractor(string name, decimal hourlyRate, int hours) : Employee(name)
{
    public decimal HourlyRate { get; } = hourlyRate;
    public int Hours { get; } = hours;
}

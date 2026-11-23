public abstract class Employee(string name)
{
    public string Name { get; } = name;

    public abstract decimal MonthlyPay();

    public string Describe() => $"{Name}: {MonthlyPay()}";
}

public class SalariedEmployee(string name, decimal salary) : Employee(name)
{
    public decimal Salary { get; } = salary;

    public override decimal MonthlyPay() => Salary;
}

public class Manager(string name, decimal salary, decimal bonus) : SalariedEmployee(name, salary)
{
    public decimal Bonus { get; } = bonus;

    public override decimal MonthlyPay() => base.MonthlyPay() + Bonus;
}

public class Contractor(string name, decimal hourlyRate, int hours) : Employee(name)
{
    public decimal HourlyRate { get; } = hourlyRate;
    public int Hours { get; } = hours;

    public override decimal MonthlyPay() => HourlyRate * Hours;
}

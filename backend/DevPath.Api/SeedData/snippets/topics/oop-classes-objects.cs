public class Employee
{
    public Employee(string name, decimal salary)
    {
        Name = name;
        Salary = salary;
    }

    public string Name { get; }
    public decimal Salary { get; private set; }

    public void GiveRaise(decimal percent) => Salary += Salary * percent / 100;
}

var sara = new Employee("Sara", 12_000m);
sara.GiveRaise(10);
Console.WriteLine($"{sara.Name}: {sara.Salary:N2}");   // Sara: 13,200.00

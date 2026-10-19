List<Employee> staff =
[
    new SalariedEmployee("Omar", 15_000m),
    new HourlyEmployee("Lina", 120m, 80),
];

decimal payroll = 0;
foreach (var employee in staff)
    payroll += employee.CalculatePay();   // the right override runs for each object

// Instead of: switch (discountType) { case "Vip": ... case "Seasonal": ... }
public interface IDiscount { decimal Apply(decimal total); }
public class VipDiscount : IDiscount { public decimal Apply(decimal t) => t * 0.9m; }
public class NoDiscount : IDiscount { public decimal Apply(decimal t) => t; }

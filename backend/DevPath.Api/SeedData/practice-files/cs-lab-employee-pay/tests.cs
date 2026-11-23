public static class Tests
{
    [Test("A salaried employee earns the salary")]
    public static void Salaried() => Assert.Equal(20000m, new SalariedEmployee("Mona", 20000m).MonthlyPay());

    [Test("A manager earns the salary plus the bonus")]
    public static void ManagerPay() => Assert.Equal(35000m, new Manager("Omar", 30000m, 5000m).MonthlyPay());

    [Test("A contractor earns rate × hours")]
    public static void ContractorPay() => Assert.Equal(12000m, new Contractor("Sara", 150m, 80).MonthlyPay());

    [Test("Through the base type, each object uses its own MonthlyPay")]
    public static void Polymorphism()
    {
        List<Employee> staff = [new SalariedEmployee("Mona", 20000m), new Manager("Omar", 30000m, 5000m), new Contractor("Sara", 150m, 80)];
        Assert.Equal(67000m, staff.Sum(e => e.MonthlyPay()));
    }

    [Test("Describe shows the name and the right pay")]
    public static void DescribeUsesOverride() => Assert.Equal("Omar: 35000", new Manager("Omar", 30000m, 5000m).Describe());
}

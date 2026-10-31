public static class Temperature
{
    public static double ToFahrenheit(double celsius) => Math.Round(celsius * 9.0 / 5 + 32, 1);

    public static double ToCelsius(double fahrenheit) => Math.Round((fahrenheit - 32) * 5.0 / 9, 1);
}

decimal ShippingFee(string method) => method switch
{
    "Express"  => 50m,
    "Standard" => 20m,
    "Pickup"   => 0m,
    _ => throw new ArgumentException($"Unknown method: {method}")
};

string Grade(int score) => score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    _     => "F"
};

// Guard clause instead of deep nesting
void Ship(Order? order)
{
    if (order is null) return;
    if (!order.IsPaid) throw new InvalidOperationException("Order is not paid.");
    // ... ship it
}

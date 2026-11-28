data class Order(val customer: String, val amount: Double, val paid: Boolean)

// Return each customer's total paid amount, highest first.
fun totalsByCustomer(orders: List<Order>): List<Pair<String, Double>> =
    orders.filter { it.paid }
        .groupBy { it.customer }
        .mapValues { (_, list) -> list.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }

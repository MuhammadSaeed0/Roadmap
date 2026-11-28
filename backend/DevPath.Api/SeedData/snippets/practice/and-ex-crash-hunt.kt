data class Courier(val name: String)
data class Order(val id: Int, val total: Double, val courier: Courier?)

fun courierLabel(order: Order): String = "Courier: " + order.courier!!.name

@Composable
fun OrderRow(order: Order) {
    Row { Text("#${order.id}"); Spacer(Modifier.width(8.dp)); Text(courierLabel(order)) }
}

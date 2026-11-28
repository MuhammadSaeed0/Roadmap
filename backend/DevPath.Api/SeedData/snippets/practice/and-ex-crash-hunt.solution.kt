fun courierLabel(order: Order): String =
    order.courier?.name?.let { "Courier: $it" } ?: "Courier not assigned"

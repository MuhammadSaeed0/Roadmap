class OrderDetailViewModel : ViewModel() {
    lateinit var order: Order                    // set by the previous screen
    val total: String get() = order.items.sumOf { it.priceCents * it.qty }.formatCents()
}

// Previous screen
viewModel<OrderDetailViewModel>().order = selectedOrder
navController.navigate("order_detail")

// Stateless: receives the value and reports changes. Easy to reuse, preview and test.
@Composable
fun QuantityStepper(quantity: Int, onQuantityChange: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onQuantityChange(quantity - 1) }, enabled = quantity > 1) {
            Icon(Icons.Default.Remove, contentDescription = "Decrease")
        }
        Text("$quantity", style = MaterialTheme.typography.titleMedium)
        IconButton(onClick = { onQuantityChange(quantity + 1) }) {
            Icon(Icons.Default.Add, contentDescription = "Increase")
        }
    }
}

class CartViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state = _state.asStateFlow()
    fun setQuantity(id: Int, quantity: Int) = _state.update { it.withQuantity(id, quantity) }
}

@Composable
fun CartScreen(vm: CartViewModel = viewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()         // state flows down
    LazyColumn {
        items(state.items, key = { it.id }) { item ->
            QuantityStepper(item.quantity, onQuantityChange = { vm.setQuantity(item.id, it) })  // events flow up
        }
    }
}

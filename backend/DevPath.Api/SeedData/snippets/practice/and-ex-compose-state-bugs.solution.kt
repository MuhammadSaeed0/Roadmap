@Composable
fun ProductScreen(price: Double) {
    var likes by remember { mutableStateOf(0) }
    var query by rememberSaveable { mutableStateOf("") }
    var quantity by rememberSaveable { mutableStateOf(1) }
    Column {
        TextField(value = query, onValueChange = { query = it })
        Button(onClick = { likes++ }) { Text("Likes: $likes") }
        Stepper(quantity, onQuantityChange = { quantity = it })
        Text("Total: ${price * quantity}")
    }
}

@Composable
fun Stepper(quantity: Int, onQuantityChange: (Int) -> Unit) {
    Button(onClick = { onQuantityChange(quantity + 1) }) { Text("Qty: $quantity") }
}

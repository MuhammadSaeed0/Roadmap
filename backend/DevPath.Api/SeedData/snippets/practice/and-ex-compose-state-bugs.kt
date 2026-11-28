@Composable
fun ProductScreen(price: Double) {
    var likes = 0
    var query by remember { mutableStateOf("") }
    Column {
        TextField(value = query, onValueChange = { query = it })
        Button(onClick = { likes++ }) { Text("Likes: $likes") }
        Stepper()
        Text("Total: $price")
    }
}

@Composable
fun Stepper() {
    var quantity by remember { mutableStateOf(1) }
    Button(onClick = { quantity++ }) { Text("Qty: $quantity") }
}

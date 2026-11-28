@Composable
fun ProductCard(product: Product, onAddToCart: () -> Unit, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = product.imageUrl, contentDescription = null,
                modifier = Modifier.size(64.dp).clip(RoundedCornerShape(8.dp)),
            )
            Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                Text(product.name, style = MaterialTheme.typography.titleMedium)
                Text("${product.price} EGP", style = MaterialTheme.typography.bodyMedium)
            }
            Button(onClick = onAddToCart) { Text("Add") }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ProductCardPreview() {
    AppTheme { ProductCard(Product(1, "Notebook", 45.0, imageUrl = ""), onAddToCart = {}) }
}

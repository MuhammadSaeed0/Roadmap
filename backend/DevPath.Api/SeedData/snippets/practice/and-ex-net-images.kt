@Composable
fun ProductGrid(products: List<Product>) {
    LazyVerticalGrid(columns = GridCells.Fixed(2)) {
        items(products) { product ->
            val context = LocalContext.current
            val loader = ImageLoader.Builder(context).build()
            AsyncImage(
                model = product.imageUrl,             // 4000 x 4000 original
                imageLoader = loader,
                contentDescription = "",
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
            )
        }
    }
}

@Composable
fun ProductRow(product: Product, isFavourite: Boolean, onFavourite: () -> Unit, onOpen: () -> Unit) {
    Row(Modifier.fillMaxWidth().height(40.dp).clickable { onOpen() }.padding(left = 8.dp)) {
        AsyncImage(product.imageUrl, contentDescription = "image", modifier = Modifier.size(32.dp))
        Text(product.name, fontSize = 14.sp, maxLines = 1)
        Icon(Icons.Default.Favorite, contentDescription = null, modifier = Modifier.size(20.dp).clickable { onFavourite() })
    }
}

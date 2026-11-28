@Composable
fun ProductTile(product: Product, modifier: Modifier = Modifier) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(product.thumbnailUrl)
            .crossfade(true)
            .build(),
        contentDescription = product.name,
        placeholder = painterResource(R.drawable.placeholder_gray),
        error = painterResource(R.drawable.ic_broken_image),
        contentScale = ContentScale.Crop,
        modifier = modifier.aspectRatio(1f).clip(RoundedCornerShape(12.dp)),
    )
}

// One ImageLoader for the whole app, sharing the app's OkHttpClient.
class App : Application(), SingletonImageLoader.Factory {
    @Inject lateinit var okHttp: OkHttpClient
    override fun newImageLoader(context: PlatformContext) = ImageLoader.Builder(context)
        .components { add(OkHttpNetworkFetcherFactory(callFactory = { okHttp })) }
        .memoryCache { MemoryCache.Builder().maxSizePercent(context, 0.20).build() }
        .diskCache { DiskCache.Builder().directory(cacheDir.resolve("images")).maxSizeBytes(100L * 1024 * 1024).build() }
        .build()
}

// Sequential-looking code that never blocks a thread.
suspend fun loadProductPage(id: Int): ProductPage = coroutineScope {
    val product = async { api.product(id) }          // these two run in parallel
    val reviews = async { api.reviews(id) }
    ProductPage(product.await(), reviews.await())    // if one fails, the other is cancelled
}

class ProductViewModel(private val api: ShopApi) : ViewModel() {
    private val _page = MutableStateFlow<ProductPage?>(null)
    val page = _page.asStateFlow()

    fun load(id: Int) {
        viewModelScope.launch {                       // cancelled when the ViewModel is cleared
            _page.value = loadProductPage(id)
        }
    }
}

// Turning a callback API into a suspend function.
suspend fun FusedLocationProviderClient.currentLocation(): Location? =
    suspendCancellableCoroutine { cont ->
        val cts = CancellationTokenSource()
        getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.token)
            .addOnSuccessListener { cont.resume(it) }
            .addOnFailureListener { cont.resumeWithException(it) }
        cont.invokeOnCancellation { cts.cancel() }
    }

class TokenRefresher(private val auth: AuthApi, private val store: TokenStore) {
    private val mutex = Mutex()

    // Many requests may get 401 together; only one refresh runs, the others reuse its result.
    suspend fun freshToken(expired: String): String = mutex.withLock {
        val current = store.accessToken()
        if (current != expired) return current               // someone already refreshed
        val tokens = auth.refresh(store.refreshToken())
        store.save(tokens)
        tokens.access
    }
}

class CartViewModel : ViewModel() {
    private val _cart = MutableStateFlow(Cart())
    // Wrong under concurrency: two updates can read the same old value.
    // fun add(item: Item) { _cart.value = _cart.value.copy(items = _cart.value.items + item) }
    fun add(item: Item) = _cart.update { it.copy(items = it.items + item) }   // compare-and-set loop
}

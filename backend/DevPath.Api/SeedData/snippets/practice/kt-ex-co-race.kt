class CartStore {
    private val _cart = MutableStateFlow(Cart())
    val cart = _cart.asStateFlow()
    fun add(item: Item) { _cart.value = _cart.value.copy(items = _cart.value.items + item) }
}

class TokenRefresher(private val api: AuthApi, private val store: TokenStore) {
    suspend fun refresh(): String {
        val tokens = api.refresh(store.refreshToken)
        store.save(tokens)
        return tokens.access
    }
}

class TokenAuthenticator(private val store: TokenStore, private val api: AuthApi) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? = runBlocking {
        val refreshed = runCatching { api.refresh(store.refreshToken()!!) }.getOrNull()
        if (refreshed == null) {
            store.clear()
            EventBus.post(SignedOut)
            return@runBlocking null
        }
        store.save(refreshed.access, refreshed.refresh)
        response.request.newBuilder().header("Authorization", "Bearer ${refreshed.access}").build()
    }
}

// api is created from the same OkHttpClient that uses this authenticator.

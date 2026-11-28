class TokenAuthenticator(
    private val store: TokenStore,
    private val refreshApi: RefreshApi,        // separate OkHttpClient: no authenticator
    private val session: SessionEvents,
) : Authenticator {
    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? = runBlocking {
        if (generateSequence(response) { it.priorResponse }.count() > 1) return@runBlocking null
        val used = response.request.header("Authorization")?.removePrefix("Bearer ")
        val token = mutex.withLock {
            val current = store.accessToken()
            if (current != null && current != used) return@withLock current   // already refreshed
            val refreshed = store.refreshToken()?.let { rt -> runCatching { refreshApi.refresh(rt) }.getOrNull() }
            refreshed?.also { store.save(it.access, it.refresh) }?.access
        }
        if (token == null) { store.clear(); session.signOut(); null }
        else response.request.newBuilder().header("Authorization", "Bearer $token").build()
    }
}

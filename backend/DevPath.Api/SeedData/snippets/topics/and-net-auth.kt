class AuthInterceptor(private val tokens: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val access = tokens.accessTokenBlocking() ?: return chain.proceed(chain.request())
        return chain.proceed(chain.request().newBuilder().header("Authorization", "Bearer $access").build())
    }
}

class TokenAuthenticator(
    private val tokens: TokenStore,
    private val authApi: AuthApi,                 // its own OkHttpClient, without this authenticator
    private val session: SessionEvents,
) : Authenticator {
    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        if (responseCount(response) >= 2) return null           // don't loop
        val failedToken = response.request.header("Authorization")?.removePrefix("Bearer ")
        val fresh = runBlocking {                               // OkHttp calls this on a background thread
            mutex.withLock {
                val current = tokens.accessToken()
                if (current != null && current != failedToken) return@withLock current   // someone refreshed
                val refresh = tokens.refreshToken() ?: return@withLock null
                runCatching { authApi.refresh(RefreshRequest(refresh)) }.getOrNull()
                    ?.also { tokens.save(it.accessToken, it.refreshToken) }?.accessToken
            }
        }
        if (fresh == null) { session.signOut(); return null }
        return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()
    }

    private fun responseCount(r: Response): Int = generateSequence(r) { it.priorResponse }.count()
}

class HeadersInterceptor(private val appVersion: String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .header("Accept-Language", Locale.getDefault().toLanguageTag())
            .header("X-App-Version", appVersion)
            .build()
        return chain.proceed(request)
    }
}

@Provides @Singleton
fun okHttp(@ApplicationContext context: Context): OkHttpClient = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(20, TimeUnit.SECONDS)
    .callTimeout(30, TimeUnit.SECONDS)
    .cache(Cache(File(context.cacheDir, "http"), 10L * 1024 * 1024))
    .addInterceptor(HeadersInterceptor(BuildConfig.VERSION_NAME))
    .apply {
        if (BuildConfig.DEBUG) addInterceptor(
            HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
                redactHeader("Authorization")
            }
        )
    }
    .build()

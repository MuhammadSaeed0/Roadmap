// shared/src/commonMain/kotlin/NewsRepository.kt
class NewsRepository(private val client: HttpClient, private val db: NewsDatabase) {
    fun feed(): Flow<List<Article>> = db.articleQueries.all().asFlow().mapToList(Dispatchers.IO)

    suspend fun refresh() {
        val fresh: List<ArticleDto> = client.get("https://api.example.com/news").body()
        db.transaction { fresh.forEach { db.articleQueries.upsert(it.id, it.title, it.url) } }
    }
}

// Platform-specific pieces behind expect/actual
expect fun platformName(): String

// shared/src/androidMain/kotlin/Platform.android.kt
actual fun platformName(): String = "Android ${android.os.Build.VERSION.SDK_INT}"

// shared/src/iosMain/kotlin/Platform.ios.kt
actual fun platformName(): String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion

// shared/src/commonTest/kotlin/NewsRepositoryTest.kt runs on every target

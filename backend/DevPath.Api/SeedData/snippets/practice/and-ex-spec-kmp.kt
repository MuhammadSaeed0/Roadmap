// shared/src/commonMain/kotlin/Quotes.kt
@Serializable
data class Quote(val id: Int, val text: String, val author: String)

class QuotesApi(private val client: HttpClient) {
    suspend fun latest(): List<Quote> = TODO("GET https://api.example.com/quotes")
}

class QuotesRepository(private val api: QuotesApi) {
    val quotes: StateFlow<List<Quote>> = TODO()
    suspend fun refresh(): Unit = TODO()
}

expect fun createClient(): HttpClient

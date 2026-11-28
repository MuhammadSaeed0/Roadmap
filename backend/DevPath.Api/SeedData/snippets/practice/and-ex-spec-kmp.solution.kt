@Serializable
data class Quote(val id: Int, val text: String, val author: String)

class QuotesApi(private val client: HttpClient) {
    suspend fun latest(): List<Quote> = client.get("https://api.example.com/quotes").body()
}

class QuotesRepository(private val api: QuotesApi) {
    private val cache = MutableStateFlow<List<Quote>>(emptyList())
    val quotes: StateFlow<List<Quote>> = cache
    suspend fun refresh() { cache.value = api.latest() }
}

fun httpClient(engine: HttpClientEngine) = HttpClient(engine) { install(ContentNegotiation) { json() } }

// commonTest
class QuotesRepositoryTest {
    @Test fun refresh_loads_quotes() = runTest {
        val engine = MockEngine { respond("""[{"id":1,"text":"a","author":"x"},{"id":2,"text":"b","author":"y"}]""",
            headers = headersOf(HttpHeaders.ContentType, "application/json")) }
        val repo = QuotesRepository(QuotesApi(httpClient(engine)))
        repo.refresh()
        assertEquals(2, repo.quotes.value.size)
    }
}

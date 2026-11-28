suspend fun loadDashboard(): Dashboard = supervisorScope {
    // Each widget may fail on its own without cancelling the others.
    val weather = async { runCatchingCancellable { withTimeout(10.seconds) { api.weather() } } }
    val news = async { runCatchingCancellable { withTimeout(10.seconds) { api.news() } } }
    Dashboard(weather.await().getOrNull(), news.await().getOrNull())
}

suspend inline fun <T> runCatchingCancellable(block: () -> T): Result<T> = try {
    Result.success(block())
} catch (e: CancellationException) {
    throw e                                   // cancellation must keep propagating
} catch (e: Exception) {
    Result.failure(e)
}

suspend fun countPrimes(limit: Int): Int = withContext(Dispatchers.Default) {
    var count = 0
    for (n in 2..limit) {
        ensureActive()                        // cooperative: stop promptly when cancelled
        if ((2..sqrt(n.toDouble()).toInt()).none { n % it == 0 }) count++
    }
    count
}

val handler = CoroutineExceptionHandler { _, e -> Log.e("Sync", "Background sync failed", e) }
fun startSync(scope: CoroutineScope) = scope.launch(handler) { syncRepository.sync() }

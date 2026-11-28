suspend fun <T> retryWithBackoff(
    times: Int = 3,
    initialDelay: Long = 1_000,
    factor: Double = 2.0,
    shouldRetry: (Throwable) -> Boolean = { it is IOException },
    block: suspend () -> T,
): T {
    var currentDelay = initialDelay
    for (attempt in 1..times) {
        try {
            return block()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            if (attempt == times || !shouldRetry(e)) throw e
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong()
        }
    }
    error("unreachable")
}

// Challenge: make this safe for coroutines and keep the call site the same.
suspend fun <T> safeRunCatching(block: suspend () -> T): Result<T> = try {
    Result.success(block())
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    Result.failure(e)
}

sealed interface DataError {
    data object Network : DataError
    data object Unauthorized : DataError
    data object NotFound : DataError
    data class Server(val code: Int) : DataError
    data class Unknown(val cause: Throwable) : DataError
}

suspend fun <T> safeCall(block: suspend () -> T): Result<T> = try {
    Result.success(block())
} catch (e: CancellationException) {
    throw e                                        // never swallow cancellation
} catch (e: Throwable) {
    Result.failure(DataException(e.toDataError()))
}

class DataException(val error: DataError) : Exception()

fun Throwable.toDataError(): DataError = when (this) {
    is IOException -> DataError.Network
    is HttpException -> when (code()) {
        401 -> DataError.Unauthorized
        404 -> DataError.NotFound
        else -> DataError.Server(code())
    }
    else -> DataError.Unknown(this)
}

fun DataError.userMessage(): String = when (this) {
    DataError.Network -> "You're offline. Showing saved data."
    DataError.Unauthorized -> "Please sign in again."
    DataError.NotFound -> "This item is no longer available."
    is DataError.Server -> "The server is having trouble. Try again soon."
    is DataError.Unknown -> "Something unexpected happened."
}

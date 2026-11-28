sealed interface NetworkError {
    data object NoConnection : NetworkError
    data object Timeout : NetworkError
    data object Unauthorized : NetworkError
    data object NotFound : NetworkError
    data class Validation(val field: String?, val message: String) : NetworkError
    data class Server(val code: Int) : NetworkError
    data class Unexpected(val cause: Throwable) : NetworkError
}

suspend fun <T> safeApiCall(call: suspend () -> T): Result<T, NetworkError> = try {
    Result.Ok(call())
} catch (e: CancellationException) {
    throw e                                             // never swallow cancellation
} catch (e: UnknownHostException) {
    Result.Err(NetworkError.NoConnection)
} catch (e: SocketTimeoutException) {
    Result.Err(NetworkError.Timeout)
} catch (e: HttpException) {
    Result.Err(
        when (e.code()) {
            401 -> NetworkError.Unauthorized
            404 -> NetworkError.NotFound
            422 -> e.response()?.errorBody()?.string().toValidation()
            else -> NetworkError.Server(e.code())
        }
    )
} catch (e: SerializationException) {
    Result.Err(NetworkError.Unexpected(e))
}

// Challenge: load all ids in parallel, at most `parallelism` at once, keep order.
suspend fun <T> loadAll(ids: List<Int>, parallelism: Int, load: suspend (Int) -> T): List<T> {
    val semaphore = Semaphore(parallelism)
    return coroutineScope {
        ids.map { id -> async { semaphore.withPermit { load(id) } } }.awaitAll()
    }
}

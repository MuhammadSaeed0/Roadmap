// Challenge: complete the pipeline so stale results never win.
@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
fun searchResults(query: Flow<String>, search: (String) -> Flow<List<String>>): Flow<List<String>> =
    query
        .debounce(300)
        .map { it.trim() }
        .distinctUntilChanged()
        .flatMapLatest { q -> if (q.length < 2) flowOf(emptyList()) else search(q) }
        .catch { emit(emptyList()) }

class ReportsRepository(
    private val file: File,
    private val io: CoroutineDispatcher = Dispatchers.IO,
    private val cpu: CoroutineDispatcher = Dispatchers.Default,
) {
    suspend fun totalsByCategory(): Map<String, Double> {
        val text = withContext(io) { file.readText() }
        return withContext(cpu) {
            text.lineSequence().drop(1).map { it.split(",") }
                .groupBy({ it[0] }, { it[2].toDouble() }).mapValues { (_, v) -> v.sum() }
        }
    }
}

class ReportsViewModel(private val repo: ReportsRepository) : ViewModel() {
    private val _state = MutableStateFlow<Map<String, Double>>(emptyMap())
    val state = _state.asStateFlow()
    init { viewModelScope.launch { _state.value = repo.totalsByCategory() } }
}

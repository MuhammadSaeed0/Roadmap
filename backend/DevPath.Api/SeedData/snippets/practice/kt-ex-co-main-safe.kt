class ReportsViewModel(private val file: File) : ViewModel() {
    val state = MutableStateFlow<Map<String, Double>>(emptyMap())
    init {
        viewModelScope.launch {
            val rows = file.readText().lines().drop(1).map { it.split(",") }
            state.value = rows.groupBy { it[0] }.mapValues { (_, l) -> l.sumOf { it[2].toDouble() } }
        }
    }
}

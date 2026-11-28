class SearchViewModel(private val repo: SearchRepository) : ViewModel() {
    val query = MutableLiveData("")
    val results = MutableStateFlow<List<Item>>(emptyList())
    val loading = MutableStateFlow(false)
    val error = MutableLiveData<String?>(null)

    fun search() = viewModelScope.launch {
        loading.value = true
        try { results.value = repo.search(query.value ?: "") } catch (e: Exception) { error.value = e.message }
        loading.value = false
    }
}

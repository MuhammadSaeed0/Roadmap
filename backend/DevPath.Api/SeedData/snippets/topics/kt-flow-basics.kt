class SearchViewModel(private val repo: ProductRepository) : ViewModel() {
    private val query = MutableStateFlow("")

    @OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
    val results: StateFlow<List<Product>> = query
        .debounce(300)                                 // wait until the user pauses typing
        .map { it.trim() }
        .distinctUntilChanged()
        .flatMapLatest { q ->                          // a new query cancels the previous search
            if (q.length < 2) flowOf(emptyList()) else repo.search(q)
        }
        .catch { emit(emptyList()) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun onQueryChange(text: String) { query.value = text }
}

// A callback API as a Flow.
fun SensorManager.stepCounts(): Flow<Int> = callbackFlow {
    val listener = object : SensorEventListener {
        override fun onSensorChanged(e: SensorEvent) { trySend(e.values[0].toInt()) }
        override fun onAccuracyChanged(s: Sensor?, a: Int) = Unit
    }
    registerListener(listener, getDefaultSensor(Sensor.TYPE_STEP_COUNTER), SensorManager.SENSOR_DELAY_NORMAL)
    awaitClose { unregisterListener(listener) }        // runs when the collector stops
}

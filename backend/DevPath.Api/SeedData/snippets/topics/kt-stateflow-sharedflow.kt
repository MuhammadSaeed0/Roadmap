class PlayerViewModel(player: PlayerRepository) : ViewModel() {
    // State: always has a value, replays it, skips duplicates.
    private val _state = MutableStateFlow(PlayerUiState())
    val state: StateFlow<PlayerUiState> = _state.asStateFlow()

    // One-off events: each one is received once.
    private val _events = Channel<PlayerEvent>(Channel.BUFFERED)
    val events: Flow<PlayerEvent> = _events.receiveAsFlow()

    fun onAddToPlaylist(song: Song) = viewModelScope.launch {
        _state.update { it.copy(saving = true) }               // atomic read-modify-write
        player.addToPlaylist(song)
        _state.update { it.copy(saving = false) }
        _events.send(PlayerEvent.ShowMessage("Added to playlist"))
    }
}

// Hot, shared: the mini player and the full player read the same position stream.
class PlayerRepository(engine: PlayerEngine, appScope: CoroutineScope) {
    val position: SharedFlow<Long> = engine.positionUpdates()
        .shareIn(appScope, SharingStarted.WhileSubscribed(), replay = 1)
}

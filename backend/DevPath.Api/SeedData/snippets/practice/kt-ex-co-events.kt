class NoteViewModel(private val repo: NotesRepository) : ViewModel() {
    val state = MutableStateFlow(NoteState())
    val message = MutableStateFlow<String?>(null)

    fun save() = viewModelScope.launch {
        repo.save(state.value.note)
        state.value = state.value.copy(dirty = false)
        message.value = "Saved"
    }
}

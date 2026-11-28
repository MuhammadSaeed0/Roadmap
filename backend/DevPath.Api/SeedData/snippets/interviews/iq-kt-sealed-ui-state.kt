sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<String>) : UiState
    data class Error(val message: String) : UiState
}

// Challenge: write render(state) with an exhaustive when, then add an Empty state
// and see which code the compiler asks you to update.
fun render(state: UiState): String = when (state) {
    UiState.Loading -> "Loading..."
    is UiState.Success -> state.items.joinToString()
    is UiState.Error -> "Error: ${state.message}"
}

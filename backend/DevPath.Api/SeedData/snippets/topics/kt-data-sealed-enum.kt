data class Task(val id: Int, val title: String, val done: Boolean = false)

enum class Priority(val label: String) { LOW("Low"), NORMAL("Normal"), HIGH("High") }

sealed interface UiState {
    data object Loading : UiState
    data class Success(val tasks: List<Task>) : UiState
    data class Error(val message: String) : UiState
}

fun render(state: UiState): String = when (state) {     // no else: every case must be handled
    UiState.Loading -> "Loading..."
    is UiState.Success -> "${state.tasks.size} tasks"
    is UiState.Error -> "Error: ${state.message}"
}

fun main() {
    val task = Task(1, "Buy milk")
    val finished = task.copy(done = true)
    val (id, title) = finished
    println("$id $title ${finished.done} ${task == Task(1, "Buy milk")}")
    println(render(UiState.Success(listOf(task))))
    println(Priority.HIGH.label)
}

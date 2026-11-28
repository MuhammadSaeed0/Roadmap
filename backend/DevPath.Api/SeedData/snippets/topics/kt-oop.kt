interface TaskDataSource {
    fun all(): List<String>
    fun add(title: String)
}

class InMemoryTasks : TaskDataSource {
    private val tasks = mutableListOf<String>()
    override fun all(): List<String> = tasks.toList()
    override fun add(title: String) { tasks += title }
}

class TaskRepository(private val source: TaskDataSource) {     // composition: depends on an interface
    fun addTask(title: String) {
        require(title.isNotBlank()) { "A task needs a title" }
        source.add(title.trim())
    }
    fun count() = source.all().size
}

open class Animal(val name: String) {
    open fun sound() = "..."
}
class Cat(name: String) : Animal(name) {
    override fun sound() = "Meow"
}

object IdGenerator {                       // a singleton
    private var next = 1
    fun nextId() = next++
}

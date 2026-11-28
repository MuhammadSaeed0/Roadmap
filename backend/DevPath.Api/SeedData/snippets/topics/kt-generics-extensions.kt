class Stack<T> {
    private val items = mutableListOf<T>()
    fun push(item: T) { items += item }
    fun pop(): T? = items.removeLastOrNull()
    fun peek(): T? = items.lastOrNull()
}

fun <T : Comparable<T>> maxOfOrNull(items: List<T>): T? = items.maxOrNull()

fun String.isEmail(): Boolean = contains('@') && substringAfter('@').contains('.')
val Int.isEven: Boolean get() = this % 2 == 0

data class Settings(var theme: String = "light", var fontSize: Int = 14)

fun main() {
    val settings = Settings().apply { theme = "dark"; fontSize = 16 }      // configure
    val length = readlnOrNull()?.let { it.trim().length } ?: 0              // nullable + transform
    val saved = settings.also { println("Saving $it") }                     // side effect
    println("${"sara@example.com".isEmail()} ${4.isEven} $length ${maxOfOrNull(listOf(3, 9, 4))} $saved")
}

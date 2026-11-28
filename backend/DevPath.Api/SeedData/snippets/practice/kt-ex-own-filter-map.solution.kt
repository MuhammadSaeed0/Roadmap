fun <T> myFilter(items: List<T>, keep: (T) -> Boolean): List<T> {
    val result = mutableListOf<T>()
    for (item in items) if (keep(item)) result += item
    return result
}

fun <T, R> myMap(items: List<T>, transform: (T) -> R): List<R> {
    val result = mutableListOf<R>()
    for (item in items) result += transform(item)
    return result
}

fun main() {
    println(myMap(myFilter((1..10).toList()) { it % 2 == 0 }) { it * it })
}

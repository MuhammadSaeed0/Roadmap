// Challenge: firstUnique("swiss") == 'w', firstUnique("aabb") == null
fun firstUnique(text: String): Char? {
    val counts = text.groupingBy { it }.eachCount()
    return text.firstOrNull { counts[it] == 1 }
}

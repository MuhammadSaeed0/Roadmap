sealed interface ParseResult {
    data class Ok(val age: Int) : ParseResult
    data class Invalid(val message: String) : ParseResult
}

fun parseAge(input: String): ParseResult {
    val age = input.trim().toIntOrNull() ?: return ParseResult.Invalid("Enter a number")
    if (age !in 0..120) return ParseResult.Invalid("Age must be between 0 and 120")
    return ParseResult.Ok(age)
}

class Order(val quantity: Int) {
    init { require(quantity > 0) { "Quantity must be positive" } }
}

fun firstUnique(text: String): Char? {
    val counts = text.groupingBy { it }.eachCount()
    return text.firstOrNull { counts[it] == 1 }
}

fun main() {
    println(parseAge("42"))
    println(parseAge("abc"))
    val result = runCatching { Order(0) }
    println(result.exceptionOrNull()?.message)        // Quantity must be positive
    println(firstUnique("swiss"))                      // w
}

fun price(base: Double, discount: Double = 0.0, tax: Double = 0.14): Double =
    base * (1 - discount) * (1 + tax)

fun repeatAction(times: Int, action: (Int) -> Unit) {
    for (i in 1..times) action(i)
}

fun main() {
    println(price(100.0))                        // default discount and tax
    println(price(base = 100.0, discount = 0.2)) // named arguments

    val isLong: (String) -> Boolean = { it.length > 5 }
    println(listOf("Kotlin", "Java", "Compose").filter(isLong))

    repeatAction(3) { attempt -> println("Attempt $attempt") }   // trailing lambda
}

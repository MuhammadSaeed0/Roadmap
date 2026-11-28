fun main() {
    val name = "Sara"            // read-only, type inferred as String
    var cartItems = 2            // can change
    cartItems += 1

    val distanceKm = 12
    val fee = when (distanceKm) {
        in 0..5 -> 10.0
        in 6..15 -> 20.0
        else -> 35.0
    }
    val label = if (cartItems > 2) "Free gift included" else "Add one more for a gift"

    println("Hi $name, $cartItems items, delivery $fee EGP. $label")

    for (day in 1..7 step 2) print("$day ")    // 1 3 5 7
    println()
}

data class CartItem(val name: String, val category: String, val price: Double, val quantity: Int)

fun main() {
    val items = listOf(
        CartItem("Notebook", "Stationery", 45.0, 2),
        CartItem("Pen", "Stationery", 8.5, 5),
        CartItem("Mug", "Kitchen", 120.0, 1),
    )

    val total = items.sumOf { it.price * it.quantity }
    val categories = items.map { it.category }.toSet()
    val byCategory = items.groupBy { it.category }
    val mostExpensive = items.maxByOrNull { it.price }

    println("Total: $total")
    println("Categories: $categories")
    println(byCategory.mapValues { (_, list) -> list.size })
    println("Top item: ${mostExpensive?.name}")
}

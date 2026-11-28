data class Sale(val product: String, val category: String, val price: Double, val quantity: Int)

fun total(sales: List<Sale>) = sales.sumOf { it.price * it.quantity }

fun perCategory(sales: List<Sale>) =
    sales.groupBy { it.category }.mapValues { (_, l) -> l.sumOf { it.price * it.quantity } }

fun topThree(sales: List<Sale>) =
    sales.groupBy { it.product }.mapValues { (_, l) -> l.sumOf { it.quantity } }
        .entries.sortedByDescending { it.value }.take(3).map { it.key }

fun cheapCategories(sales: List<Sale>) =
    sales.groupBy { it.category }.filterValues { l -> l.none { it.price > 100 } }.keys

data class Address(val city: String?)
data class User(val name: String, val address: Address?)

fun cityLabel(user: User?): String = user?.address?.city ?: "City not set"

fun sumValid(inputs: List<String>): Int = inputs.mapNotNull { it.toIntOrNull() }.sum()

fun greet(name: String?) {
    val safeName = name ?: return       // leave early when there is no name
    println("Hello, $safeName")          // smart cast: safeName is String here
}

fun main() {
    println(cityLabel(User("Omar", Address("Alexandria"))))
    println(cityLabel(User("Mona", null)))
    println(sumValid(listOf("4", "x", "10", "")))   // 14
    greet(null)
}

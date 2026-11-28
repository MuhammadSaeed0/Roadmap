data class Address(val city: String?)
data class User(val name: String, val phone: String?, val address: Address?, val ageText: String?)

fun describe(user: User?): String {
    val city = user!!.address!!.city!!
    val phone = user.phone!!
    val age = user.ageText!!.toInt()
    return "${user.name} from $city, $phone, age $age"
}

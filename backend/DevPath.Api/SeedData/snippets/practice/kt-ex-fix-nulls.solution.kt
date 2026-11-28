fun describe(user: User?): String {
    if (user == null) return "Guest"
    val city = user.address?.city ?: "Unknown city"
    val phone = user.phone ?: "No phone"
    val age = user.ageText?.toIntOrNull()?.toString() ?: "not set"
    return "${user.name} from $city, $phone, age $age"
}

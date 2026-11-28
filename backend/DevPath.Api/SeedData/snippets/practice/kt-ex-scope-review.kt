fun maxInt(items: List<Int>): Int = if (items.isEmpty()) 0 else items.maxOrNull()!!
fun maxDouble(items: List<Double>): Double = if (items.isEmpty()) 0.0 else items.maxOrNull()!!

fun onSignedUp(user: User) {
    val settings = Settings()
    settings.theme = "dark"
    settings.fontSize = 16
    user.email?.let {
        it.run {
            if (contains("@") && substringAfter("@").contains(".")) {
                let { sendWelcome(it) }
            }
        }
    }
    save(settings)
}

class CheckoutViewModel : ViewModel() {
    private val client = OkHttpClient()

    fun placeOrder(cart: List<CartItem>, zone: String, coupon: String?) = viewModelScope.launch {
        var total = cart.sumOf { it.price * it.qty }
        if (coupon == "SAVE10") total *= 0.9
        total += when (zone) { "cairo" -> 30.0; "giza" -> 35.0; "alex" -> 50.0; else -> 80.0 }
        val body = """{"items":${cart.size},"total":$total}"""
        val response = client.newCall(Request.Builder().url("https://api.shop.com/orders").post(body.toRequestBody()).build()).execute()
        val id = JSONObject(response.body!!.string()).getString("id")
        FirebaseAnalytics.getInstance(App.instance).logEvent("order", null)
        message.value = "Order $id: " + String.format("%.2f EGP", total)
    }
    val message = MutableLiveData<String>()
}

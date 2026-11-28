class ProViewModel(private val prefs: SharedPreferences) : ViewModel(), PurchasesUpdatedListener {
    val priceText = "Upgrade for $4.99 / month"

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        if (result.responseCode == BillingClient.BillingResponseCode.OK) {
            purchases?.forEach {
                prefs.edit().putBoolean("is_pro", true).apply()
            }
        }
    }

    fun isPro(): Boolean = prefs.getBoolean("is_pro", false)
}

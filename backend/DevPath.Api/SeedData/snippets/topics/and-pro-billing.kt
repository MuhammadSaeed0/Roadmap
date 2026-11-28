class BillingRepository(context: Context, private val api: BillingApi, private val scope: CoroutineScope) {
    private val _purchases = MutableSharedFlow<List<Purchase>>(extraBufferCapacity = 1)

    private val client = BillingClient.newBuilder(context)
        .setListener { result, purchases ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
                scope.launch { purchases.forEach { handle(it) } }
            }
        }
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .build()

    suspend fun connect() = suspendCancellableCoroutine { cont ->
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(r: BillingResult) { if (cont.isActive) cont.resume(r.responseCode == 0) }
            override fun onBillingServiceDisconnected() = Unit           // reconnect on next call
        })
    }

    suspend fun proPlan(): ProductDetails? = client.queryProductDetails(
        QueryProductDetailsParams.newBuilder().setProductList(listOf(
            QueryProductDetailsParams.Product.newBuilder().setProductId("pro_monthly")
                .setProductType(BillingClient.ProductType.SUBS).build()
        )).build()
    ).productDetailsList?.firstOrNull()                                // price comes from here, not hard-coded

    fun buy(activity: Activity, details: ProductDetails) {
        val offer = details.subscriptionOfferDetails!!.first()        // base plan or trial offer
        client.launchBillingFlow(activity, BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details).setOfferToken(offer.offerToken).build()
        )).build())
    }

    private suspend fun handle(p: Purchase) {
        if (p.purchaseState != Purchase.PurchaseState.PURCHASED) return  // pending: wait for an update
        api.verify(VerifyRequest(p.products.first(), p.purchaseToken))  // server verifies, grants, acknowledges
    }
}

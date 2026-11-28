interface FeatureFlags {
    val newCheckout: Boolean
    val freeShippingThresholdCents: Long
    val checkoutKillSwitch: Flow<Boolean>
}

class RemoteFeatureFlags(private val rc: FirebaseRemoteConfig) : FeatureFlags {
    init {
        rc.setDefaultsAsync(mapOf(
            "new_checkout_enabled" to false,
            "free_shipping_threshold_cents" to 5_000L,
            "checkout_kill_switch" to false,
        ))
        rc.setConfigSettingsAsync(remoteConfigSettings { minimumFetchIntervalInSeconds = 3_600 })
    }

    suspend fun fetchForNextLaunch() { rc.fetch().await() }   // activate on the next start
    suspend fun activateAtStartup() { rc.activate().await() }

    override val newCheckout get() = rc.getBoolean("new_checkout_enabled")
    override val freeShippingThresholdCents get() = rc.getLong("free_shipping_threshold_cents")

    override val checkoutKillSwitch: Flow<Boolean> = callbackFlow {
        trySend(rc.getBoolean("checkout_kill_switch"))
        val registration = rc.addOnConfigUpdateListener(object : ConfigUpdateListener {
            override fun onUpdate(update: ConfigUpdate) {
                if ("checkout_kill_switch" in update.updatedKeys) {
                    rc.activate().addOnCompleteListener { trySend(rc.getBoolean("checkout_kill_switch")) }
                }
            }
            override fun onError(error: FirebaseRemoteConfigException) = Unit
        })
        awaitClose { registration.remove() }
    }
}

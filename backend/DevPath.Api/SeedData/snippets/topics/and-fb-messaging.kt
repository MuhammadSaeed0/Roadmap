class PushService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        TokenSyncWorker.enqueue(applicationContext, token)     // send to your server, retried by WorkManager
    }

    override fun onMessageReceived(message: RemoteMessage) {
        when (message.data["type"]) {
            "item_sold" -> {
                OrderSyncWorker.enqueue(applicationContext)
                Notifications.itemSold(applicationContext, itemId = message.data["itemId"].orEmpty())
            }
            "sync" -> OrderSyncWorker.enqueue(applicationContext)
        }
    }
}

class PushTokens(private val api: DeviceApi, private val messaging: FirebaseMessaging) {
    suspend fun register(userId: String) = api.addDevice(userId, messaging.token.await())
    suspend fun unregister(userId: String) {
        api.removeDevice(userId, messaging.token.await())
        messaging.deleteToken().await()                       // signed-out device gets nothing
    }
    fun followDigest(enabled: Boolean) {
        if (enabled) messaging.subscribeToTopic("weekly-digest") else messaging.unsubscribeFromTopic("weekly-digest")
    }
}

// Server (HTTP v1): POST https://fcm.googleapis.com/v1/projects/{project}/messages:send
// { "message": { "token": "...", "android": { "priority": "high" },
//   "data": { "type": "item_sold", "itemId": "A1" } } }

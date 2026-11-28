fun OkHttpClient.events(url: String): Flow<TrackingEvent> = callbackFlow {
    val socket = newWebSocket(Request.Builder().url(url).build(), object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            trySend(Json.decodeFromString<TrackingEvent>(text))
        }
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            close(t)                                     // let retryWhen reconnect
        }
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) = close()
    })
    awaitClose { socket.close(1000, "Screen closed") }
}

class TrackingRepository(private val client: OkHttpClient, private val dao: PositionDao) {
    fun track(orderId: String): Flow<Position> = flow {
        val since = dao.lastSequence(orderId) ?: 0
        emitAll(client.events("wss://api.example.com/orders/$orderId/track?since=$since"))
    }
        .retryWhen { cause, attempt ->
            if (cause is IOException) { delay(minOf(30_000L, 1_000L shl attempt.toInt())); true } else false
        }
        .onEach { dao.upsert(it.toEntity()) }            // dedupe by id in Room
        .map { it.position }
}

class PushService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        if (message.data["type"] == "order_updated") SyncScheduler.requestSync(applicationContext)
    }
}

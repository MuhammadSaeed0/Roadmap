interface AnalyticsTracker {
    fun lessonStarted(lessonId: String, level: String)
    fun lessonCompleted(lessonId: String, durationSeconds: Long, score: Int)
    fun paywallViewed(source: String)
    fun setCollectionEnabled(enabled: Boolean)
}

class FirebaseTracker(private val analytics: FirebaseAnalytics) : AnalyticsTracker {
    override fun lessonStarted(lessonId: String, level: String) =
        analytics.logEvent("lesson_started") { param("lesson_id", lessonId); param("level", level) }

    override fun lessonCompleted(lessonId: String, durationSeconds: Long, score: Int) =
        analytics.logEvent("lesson_completed") {
            param("lesson_id", lessonId); param("duration_s", durationSeconds); param("score", score.toLong())
        }

    override fun paywallViewed(source: String) = analytics.logEvent("paywall_viewed") { param("source", source) }

    override fun setCollectionEnabled(enabled: Boolean) {
        analytics.setAnalyticsCollectionEnabled(enabled)
        analytics.setConsent {
            analyticsStorage(if (enabled) ConsentStatus.GRANTED else ConsentStatus.DENIED)
            adStorage(ConsentStatus.DENIED)
        }
    }
}

// Performance Monitoring: a custom trace around a slow step
suspend fun <T> traced(name: String, block: suspend () -> T): T {
    val trace = Firebase.performance.newTrace(name).apply { start() }
    try { return block() } finally { trace.stop() }
}

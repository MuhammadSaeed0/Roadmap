class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Firebase.crashlytics.setCrashlyticsCollectionEnabled(!BuildConfig.DEBUG)
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.Builder().detectAll().penaltyLog().build())
        }
    }
}

// Context that makes a crash reproducible, without personal data.
fun onScreen(name: String) {
    Firebase.crashlytics.setCustomKey("screen", name)
    Firebase.crashlytics.log("open $name")           // breadcrumb
}

suspend fun loadOrders(): Result<List<Order>> = try {
    Result.success(api.orders())
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    Firebase.crashlytics.recordException(e)          // non-fatal: visible in the dashboard
    Result.failure(e)
}

// Release build: upload the R8 mapping so traces are readable
// firebaseCrashlytics { mappingFileUploadEnabled = true }

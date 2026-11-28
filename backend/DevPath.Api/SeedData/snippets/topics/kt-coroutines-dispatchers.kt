class PhotoRepository(
    private val io: CoroutineDispatcher = Dispatchers.IO,
    private val cpu: CoroutineDispatcher = Dispatchers.Default,
) {
    // Main-safe: callers on the main thread never block.
    suspend fun applyFilterAndSave(source: File, target: File): Uri {
        val bitmap = withContext(io) { BitmapFactory.decodeFile(source.path) }
        val filtered = withContext(cpu) { bitmap.grayscale() }          // CPU-heavy
        withContext(io) { target.outputStream().use { filtered.compress(Bitmap.CompressFormat.JPEG, 90, it) } }
        return Uri.fromFile(target)
    }
}

// Debug builds: crash on main-thread disk and network access.
if (BuildConfig.DEBUG) {
    StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.Builder().detectAll().penaltyLog().penaltyDeath().build())
}

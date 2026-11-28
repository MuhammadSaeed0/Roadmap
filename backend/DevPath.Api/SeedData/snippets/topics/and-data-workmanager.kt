@HiltWorker
class UploadReportsWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val reports: ReportRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = try {
        reports.uploadPending()                    // idempotent: safe to run twice
        Result.success()
    } catch (e: IOException) {
        if (runAttemptCount < 5) Result.retry() else Result.failure()
    }
}

fun enqueueUpload(context: Context) {
    val request = OneTimeWorkRequestBuilder<UploadReportsWorker>()
        .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()
    WorkManager.getInstance(context)
        .enqueueUniqueWork("upload-reports", ExistingWorkPolicy.KEEP, request)
}

// Observe from a ViewModel.
val uploadState: Flow<WorkInfo.State?> = WorkManager.getInstance(context)
    .getWorkInfosForUniqueWorkFlow("upload-reports")
    .map { it.firstOrNull()?.state }

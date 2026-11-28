class UpdateChecker(private val activity: ComponentActivity) {
    private val manager = AppUpdateManagerFactory.create(activity)
    private val launcher = activity.registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { }

    fun check(onDownloaded: () -> Unit) {
        manager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE) return@addOnSuccessListener
            val type = if (info.updatePriority() >= 4 && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE))
                AppUpdateType.IMMEDIATE else AppUpdateType.FLEXIBLE
            if (type == AppUpdateType.FLEXIBLE) {
                manager.registerListener { state -> if (state.installStatus() == InstallStatus.DOWNLOADED) onDownloaded() }
            }
            manager.startUpdateFlowForResult(info, launcher, AppUpdateOptions.newBuilder(type).build())
        }
    }

    fun completeFlexibleUpdate() = manager.completeUpdate()   // after the user taps "Restart"
}

// Ask for a review after a success moment, never after an error.
suspend fun maybeAskForReview(activity: Activity, completedWorkouts: Int) {
    if (completedWorkouts != 3) return
    val manager = ReviewManagerFactory.create(activity)
    val info = manager.requestReviewFlow().await()
    manager.launchReviewFlow(activity, info).await()          // Play decides whether the dialog shows
}

@Composable
fun NotificationsSwitch(onEnabled: () -> Unit) {
    val context = LocalContext.current
    var showRationale by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) onEnabled() else showRationale = true
    }

    Button(onClick = {
        when {
            Build.VERSION.SDK_INT < 33 -> onEnabled()        // no runtime permission before Android 13
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED -> onEnabled()
            else -> launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }) { Text("Notify me when my order ships") }

    if (showRationale) {
        AlertDialog(
            onDismissRequest = { showRationale = false },
            title = { Text("Notifications are off") },
            text = { Text("We only use them for order updates. You can turn them on in Settings.") },
            confirmButton = {
                TextButton(onClick = {
                    context.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                        .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName))
                    showRationale = false
                }) { Text("Open settings") }
            },
            dismissButton = { TextButton(onClick = { showRationale = false }) { Text("Not now") } },
        )
    }
}

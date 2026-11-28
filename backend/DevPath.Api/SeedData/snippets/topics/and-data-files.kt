// Private storage: no permission needed.
suspend fun saveReceipt(context: Context, id: String, bytes: ByteArray) = withContext(Dispatchers.IO) {
    File(context.filesDir, "receipts").apply { mkdirs() }.resolve("$id.jpg").writeBytes(bytes)
}

// Photo picker: access only to what the user chooses.
@Composable
fun PickReceipt(onPicked: (Uri) -> Unit) {
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        uri?.let(onPicked)
    }
    Button(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
        Text("Add receipt")
    }
}

// Export to a file the user chooses (Storage Access Framework).
val export = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/csv")) { uri ->
    uri ?: return@rememberLauncherForActivityResult
    scope.launch(Dispatchers.IO) {
        context.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use { out ->
            receipts.forEach { out.appendLine("${it.date},${it.total}") }   // streamed, not built in memory
        }
    }
}

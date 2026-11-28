// AndroidManifest: <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

fun exportReceipts(context: Context, receipts: List<Receipt>) {
    val file = File("/sdcard/Receipts/export.csv")
    file.parentFile?.mkdirs()
    file.writeText(receipts.joinToString("\n") { "${it.date},${it.total}" })
    val bytes = file.readBytes()
    Log.d("Export", "wrote ${bytes.size} bytes")
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/csv"
        putExtra(Intent.EXTRA_STREAM, Uri.fromFile(file))
    }
    context.startActivity(send)
}

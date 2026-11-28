fun Context.shareText(text: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    startActivity(Intent.createChooser(send, "Share order"))
}

fun Context.dial(number: String) =
    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))      // no permission needed

fun Context.openWebsite(url: String) {
    try {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    } catch (e: ActivityNotFoundException) {
        Toast.makeText(this, "No app can open this link", Toast.LENGTH_SHORT).show()
    }
}

// Explicit Intent to another screen of this app, passing a small id.
fun Context.openOrder(orderId: Int) =
    startActivity(Intent(this, OrderActivity::class.java).putExtra("orderId", orderId))

@Composable
fun AvatarPicker(onPicked: (Uri) -> Unit) {
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) onPicked(uri)
    }
    Button(onClick = { launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
        Text("Choose photo")
    }
}
